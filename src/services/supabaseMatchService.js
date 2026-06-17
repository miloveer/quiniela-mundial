import { supabase } from './supabaseClient';

function normalizeMatchFromSupabase(match) {
  return {
    id: match.id,
    externalId: match.external_id,
    stage: match.stage,
    stageId: match.stage_id,
    group: match.group_name || 'Grupo sin asignar',
    groupName: match.group_name || 'Grupo sin asignar',
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    date: match.match_date,
    stadium: match.stadium || 'Por definir',
    status: match.status || 'SCHEDULED',
    isLocked: Boolean(match.is_locked),
    result:
      match.result_home_score !== null && match.result_away_score !== null
        ? {
            homeScore: Number(match.result_home_score),
            awayScore: Number(match.result_away_score),
          }
        : null,
    source: match.source || 'manual',
    createdAt: match.created_at,
    updatedAt: match.updated_at,
  };
}

function normalizeMatchToSupabase({ leagueId, match }) {
  return {
    id: match.id,
    league_id: leagueId,
    external_id: match.externalId || match.external_id || null,
    stage: match.stage || '',
    stage_id: match.stageId || match.stage_id || 'group-stage',
    group_name:
      match.groupName ||
      match.group ||
      match.group_name ||
      'Grupo sin asignar',
    home_team: match.homeTeam || match.home_team || 'Por definir',
    away_team: match.awayTeam || match.away_team || 'Por definir',
    match_date: match.date || match.match_date || null,
    stadium: match.stadium || 'Por definir',
    status: match.status || 'SCHEDULED',
    is_locked: Boolean(match.isLocked || match.is_locked),
    result_home_score:
      match.result?.homeScore !== undefined && match.result?.homeScore !== null
        ? Number(match.result.homeScore)
        : null,
    result_away_score:
      match.result?.awayScore !== undefined && match.result?.awayScore !== null
        ? Number(match.result.awayScore)
        : null,
    source: match.source || 'manual',
    updated_at: new Date().toISOString(),
  };
}

export async function getSupabaseLeagueMatches(leagueId) {
  if (!leagueId) {
    return [];
  }

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('league_id', leagueId)
    .order('match_date', { ascending: true });

  if (error) {
    console.error('GET_SUPABASE_LEAGUE_MATCHES_ERROR:', error);
    throw error;
  }

  return (data || []).map(normalizeMatchFromSupabase);
}

export async function saveSupabaseLeagueMatches({ leagueId, matches }) {
  if (!leagueId) {
    throw new Error('MISSING_LEAGUE_ID');
  }

  if (!Array.isArray(matches) || matches.length === 0) {
    return [];
  }

  const matchesToSave = matches.map((match) =>
    normalizeMatchToSupabase({
      leagueId,
      match,
    })
  );

  const { data, error } = await supabase
    .from('matches')
    .upsert(matchesToSave, {
      onConflict: 'league_id,id',
    })
    .select('*');

  if (error) {
    console.error('SAVE_SUPABASE_LEAGUE_MATCHES_ERROR:', error);
    throw error;
  }

  return (data || []).map(normalizeMatchFromSupabase);
}

export async function updateSupabaseMatchResult({ leagueId, matchId, result }) {
  if (!leagueId || !matchId) {
    throw new Error('MISSING_MATCH_DATA');
  }

  const resultData = result
    ? {
        result_home_score: Number(result.homeScore),
        result_away_score: Number(result.awayScore),
        status: 'FINISHED',
        is_locked: true,
        updated_at: new Date().toISOString(),
      }
    : {
        result_home_score: null,
        result_away_score: null,
        status: 'SCHEDULED',
        updated_at: new Date().toISOString(),
      };

  const { data, error } = await supabase
    .from('matches')
    .update(resultData)
    .eq('league_id', leagueId)
    .eq('id', matchId)
    .select('*')
    .single();

  if (error) {
    console.error('UPDATE_SUPABASE_MATCH_RESULT_ERROR:', error);
    throw error;
  }

  return normalizeMatchFromSupabase(data);
}