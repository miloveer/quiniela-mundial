import { supabase } from './supabaseClient';

function normalizePendingPredictionFromSupabase(pendingPrediction) {
  return {
    id: pendingPrediction.id,
    leagueId: pendingPrediction.league_id,
    matchId: pendingPrediction.match_id,
    referenceName: pendingPrediction.reference_name,
    homeScore: Number(pendingPrediction.home_score),
    awayScore: Number(pendingPrediction.away_score),
    claimedBy: pendingPrediction.claimed_by,
    claimedAt: pendingPrediction.claimed_at,
    createdAt: pendingPrediction.created_at,
    updatedAt: pendingPrediction.updated_at,
  };
}

// Carga un pronóstico recibido por WhatsApp (o similar) para alguien que
// todavía no se ha unido a la liga. referenceName es el nombre que el
// admin usa para identificar a esa persona (ej. "Juan Pérez").
export async function saveSupabasePendingPrediction({
  leagueId,
  matchId,
  referenceName,
  homeScore,
  awayScore,
}) {
  if (!leagueId || !matchId || !referenceName) {
    throw new Error('MISSING_PENDING_PREDICTION_DATA');
  }

  const pendingPredictionToSave = {
    league_id: leagueId,
    match_id: matchId,
    reference_name: referenceName.trim(),
    home_score: Number(homeScore),
    away_score: Number(awayScore),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('pending_predictions')
    .upsert(pendingPredictionToSave, {
      onConflict: 'league_id,match_id,reference_name',
    })
    .select('*')
    .single();

  if (error) {
    console.error('SAVE_SUPABASE_PENDING_PREDICTION_ERROR:', error);
    throw error;
  }

  return normalizePendingPredictionFromSupabase(data);
}

// Lista todos los pronósticos pendientes de una liga (asignados o no),
// para que el admin pueda ver el estado completo.
export async function getSupabasePendingPredictions(leagueId) {
  if (!leagueId) {
    return [];
  }

  const { data, error } = await supabase
    .from('pending_predictions')
    .select('*')
    .eq('league_id', leagueId)
    .order('reference_name', { ascending: true });

  if (error) {
    console.error('GET_SUPABASE_PENDING_PREDICTIONS_ERROR:', error);
    throw error;
  }

  return (data || []).map(normalizePendingPredictionFromSupabase);
}

export async function deleteSupabasePendingPrediction(pendingPredictionId) {
  if (!pendingPredictionId) {
    throw new Error('MISSING_PENDING_PREDICTION_ID');
  }

  const { error } = await supabase
    .from('pending_predictions')
    .delete()
    .eq('id', pendingPredictionId);

  if (error) {
    console.error('DELETE_SUPABASE_PENDING_PREDICTION_ERROR:', error);
    throw error;
  }

  return true;
}

// Asigna TODOS los pronósticos pendientes de un nombre de referencia a un
// usuario real ya unido a la liga: los copia a la tabla "predictions" con
// su userId, y marca los pendientes como reclamados (no se borran, quedan
// como historial por si hay que revisar algo).
export async function claimSupabasePendingPredictionsForUser({
  leagueId,
  referenceName,
  userId,
}) {
  if (!leagueId || !referenceName || !userId) {
    throw new Error('MISSING_CLAIM_DATA');
  }

  const { data: pendingRows, error: fetchError } = await supabase
    .from('pending_predictions')
    .select('*')
    .eq('league_id', leagueId)
    .eq('reference_name', referenceName)
    .is('claimed_by', null);

  if (fetchError) {
    console.error('FETCH_PENDING_FOR_CLAIM_ERROR:', fetchError);
    throw fetchError;
  }

  const rowsToClaim = pendingRows || [];

  if (rowsToClaim.length === 0) {
    return { claimedCount: 0 };
  }

  const predictionsToInsert = rowsToClaim.map((row) => ({
    league_id: row.league_id,
    match_id: row.match_id,
    user_id: userId,
    home_score: row.home_score,
    away_score: row.away_score,
    updated_at: new Date().toISOString(),
  }));

  const { error: insertError } = await supabase
    .from('predictions')
    .upsert(predictionsToInsert, {
      onConflict: 'league_id,match_id,user_id',
    });

  if (insertError) {
    console.error('CLAIM_PENDING_INSERT_PREDICTIONS_ERROR:', insertError);
    throw insertError;
  }

  const { error: updateError } = await supabase
    .from('pending_predictions')
    .update({
      claimed_by: userId,
      claimed_at: new Date().toISOString(),
    })
    .eq('league_id', leagueId)
    .eq('reference_name', referenceName)
    .is('claimed_by', null);

  if (updateError) {
    console.error('CLAIM_PENDING_UPDATE_FLAG_ERROR:', updateError);
    throw updateError;
  }

  return { claimedCount: rowsToClaim.length };
}