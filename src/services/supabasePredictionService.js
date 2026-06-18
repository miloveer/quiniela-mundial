import { supabase } from './supabaseClient';

function normalizePredictionFromSupabase(prediction) {
  return {
    id: prediction.id,
    leagueId: prediction.league_id,
    matchId: prediction.match_id,
    userId: prediction.user_id,
    homeScore: Number(prediction.home_score),
    awayScore: Number(prediction.away_score),
    createdAt: prediction.created_at,
    updatedAt: prediction.updated_at,
  };
}

export async function getSupabaseUserPredictions({ leagueId, userId }) {
  if (!leagueId || !userId) {
    return {};
  }

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('league_id', leagueId)
    .eq('user_id', userId);

  if (error) {
    console.error('GET_SUPABASE_USER_PREDICTIONS_ERROR:', error);
    throw error;
  }

  return (data || []).reduce((acc, prediction) => {
    acc[prediction.match_id] = {
      homeScore: Number(prediction.home_score),
      awayScore: Number(prediction.away_score),
    };

    return acc;
  }, {});
}

export async function getSupabaseLeaguePredictions(leagueId) {
  if (!leagueId) {
    return [];
  }

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('league_id', leagueId);

  if (error) {
    console.error('GET_SUPABASE_LEAGUE_PREDICTIONS_ERROR:', error);
    throw error;
  }

  return (data || []).map(normalizePredictionFromSupabase);
}

export async function saveSupabasePrediction({
  leagueId,
  matchId,
  userId,
  homeScore,
  awayScore,
}) {
  if (!leagueId || !matchId || !userId) {
    throw new Error('MISSING_PREDICTION_DATA');
  }

  const predictionToSave = {
    league_id: leagueId,
    match_id: matchId,
    user_id: userId,
    home_score: Number(homeScore),
    away_score: Number(awayScore),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('predictions')
    .upsert(predictionToSave, {
      onConflict: 'league_id,match_id,user_id',
    })
    .select('*')
    .single();

  if (error) {
    console.error('SAVE_SUPABASE_PREDICTION_ERROR:', error);
    throw error;
  }

  return normalizePredictionFromSupabase(data);
}

export async function deleteSupabasePrediction({ leagueId, matchId, userId }) {
  if (!leagueId || !matchId || !userId) {
    throw new Error('MISSING_PREDICTION_DATA');
  }

  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('league_id', leagueId)
    .eq('match_id', matchId)
    .eq('user_id', userId);

  if (error) {
    console.error('DELETE_SUPABASE_PREDICTION_ERROR:', error);
    throw error;
  }

  return true;
}