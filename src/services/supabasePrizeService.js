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

  const validPrizes = prizes.filter((prize) => {
    const hasTitle = Boolean(prize?.title?.trim?.());
    const hasDescription = Boolean(prize?.description?.trim?.());
    const hasAmount = Number(prize?.amount || 0) > 0;
    const hasPercentage = Number(prize?.percentage || 0) > 0;

    return hasTitle || hasDescription || hasAmount || hasPercentage;
  });

  if (validPrizes.length === 0) {
    return [];
  }

  const prizesToSave = validPrizes.map((prize, index) => {
    const safePosition = Number.isFinite(Number(prize?.position))
      ? Number(prize.position)
      : index + 1;

    return {
      league_id: leagueId,
      position: safePosition > 0 ? safePosition : index + 1,
      title: prize?.title?.trim() || `${index + 1}° lugar`,
      description: prize?.description?.trim() || '',
      amount: Number(prize?.amount || 0),
      percentage: Number(prize?.percentage || 0),
      updated_at: new Date().toISOString(),
    };
  });

  console.log('SAVE_SUPABASE_LEAGUE_PRIZES_PAYLOAD:', prizesToSave);

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