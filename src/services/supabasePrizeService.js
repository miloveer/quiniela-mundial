import { supabase } from './supabaseClient';

function normalizePrizeFromSupabase(prize) {
  return {
    id: prize.id,
    leagueId: prize.league_id,
    position: Number(prize.position),
    title: prize.title,
    description: prize.description || '',
    amount: Number(prize.amount || 0),
    percentage: Number(prize.percentage || 0),
    createdAt: prize.created_at,
    updatedAt: prize.updated_at,
  };
}

export async function getSupabaseLeaguePrizes(leagueId) {
  if (!leagueId) {
    return [];
  }

  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .eq('league_id', leagueId)
    .order('position', { ascending: true });

  if (error) {
    console.error('GET_SUPABASE_LEAGUE_PRIZES_ERROR:', error);
    throw error;
  }

  return (data || []).map(normalizePrizeFromSupabase);
}

export async function saveSupabaseLeaguePrizes({ leagueId, prizes }) {
  if (!leagueId) {
    throw new Error('MISSING_LEAGUE_ID');
  }

  if (!Array.isArray(prizes)) {
    throw new Error('INVALID_PRIZES');
  }

  const prizesToSave = prizes.map((prize, index) => ({
    league_id: leagueId,
    position: Number(prize.position || index + 1),
    title: prize.title || `${index + 1}° lugar`,
    description: prize.description || '',
    amount: Number(prize.amount || 0),
    percentage: Number(prize.percentage || 0),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('prizes')
    .upsert(prizesToSave, {
      onConflict: 'league_id,position',
    })
    .select('*');

  if (error) {
    console.error('SAVE_SUPABASE_LEAGUE_PRIZES_ERROR:', error);
    throw error;
  }

  return (data || []).map(normalizePrizeFromSupabase);
}

export async function deleteSupabaseLeaguePrize({ leagueId, position }) {
  if (!leagueId || !position) {
    throw new Error('MISSING_PRIZE_DATA');
  }

  const { error } = await supabase
    .from('prizes')
    .delete()
    .eq('league_id', leagueId)
    .eq('position', position);

  if (error) {
    console.error('DELETE_SUPABASE_LEAGUE_PRIZE_ERROR:', error);
    throw error;
  }

  return true;
}