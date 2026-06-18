import { supabase } from './supabaseClient';

function normalizeLeagueFromSupabase(league, members = []) {
  return {
    id: league.id,
    code: league.code,
    name: league.name,
    ownerId: league.owner_id,
    ownerDisplayName: league.owner_display_name,
    ownerEmail: league.owner_email,
    entryFee: Number(league.entry_fee || 0),
    prizeMode: league.prize_mode || 'fixed',
    predictionsLocked: Boolean(league.predictions_locked),
    members: members.map((member) => member.user_id),
    createdAt: league.created_at,
    updatedAt: league.updated_at,
  };
}

export async function createSupabaseLeague({
  name,
  code,
  ownerId,
  ownerDisplayName,
  ownerEmail,
  entryFee = 0,
  prizeMode = 'fixed',
}) {
  if (!ownerId) {
    throw new Error('USER_NOT_AUTHENTICATED');
  }

  const cleanCode = code.trim().toUpperCase();

  const leagueToSave = {
    id: crypto.randomUUID(),
    code: cleanCode,
    name: name.trim(),
    owner_id: ownerId,
    owner_display_name: ownerDisplayName || '',
    owner_email: ownerEmail || '',
    entry_fee: Number(entryFee || 0),
    prize_mode: prizeMode || 'fixed',
    updated_at: new Date().toISOString(),
  };

  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert(leagueToSave)
    .select('*')
    .single();

  if (leagueError) {
    console.error('CREATE_SUPABASE_LEAGUE_ERROR:', leagueError);
    throw leagueError;
  }

  const memberToSave = {
    league_id: league.id,
    user_id: ownerId,
    display_name: ownerDisplayName || ownerEmail || 'Administrador',
    email: ownerEmail || '',
    role: 'owner',
  };

  const { error: memberError } = await supabase
    .from('league_members')
    .insert(memberToSave);

  if (memberError) {
    console.error('CREATE_SUPABASE_LEAGUE_MEMBER_ERROR:', memberError);
    throw memberError;
  }

  return normalizeLeagueFromSupabase(league, [memberToSave]);
}

export async function getSupabaseLeagueByCode(leagueCode) {
  const cleanCode = leagueCode.trim().toUpperCase();

  const { data: league, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('code', cleanCode)
    .single();

  if (error) {
    console.error('GET_SUPABASE_LEAGUE_BY_CODE_ERROR:', error);
    throw error;
  }

  const { data: members, error: membersError } = await supabase
    .from('league_members')
    .select('*')
    .eq('league_id', league.id);

  if (membersError) {
    console.error('GET_SUPABASE_LEAGUE_MEMBERS_BY_CODE_ERROR:', membersError);
    throw membersError;
  }

  return normalizeLeagueFromSupabase(league, members || []);
}

export async function joinSupabaseLeague({
  leagueCode,
  userId,
  displayName,
  email,
}) {
  if (!userId) {
    throw new Error('USER_NOT_AUTHENTICATED');
  }

  const league = await getSupabaseLeagueByCode(leagueCode);

  const memberToSave = {
    league_id: league.id,
    user_id: userId,
    display_name: displayName || email || 'Participante',
    email: email || '',
    role: league.ownerId === userId ? 'owner' : 'member',
  };

  const { error } = await supabase
    .from('league_members')
    .upsert(memberToSave, {
      onConflict: 'league_id,user_id',
    });

  if (error) {
    console.error('JOIN_SUPABASE_LEAGUE_ERROR:', error);
    throw error;
  }

  return {
    ...league,
    members: Array.from(new Set([...league.members, userId])),
  };
}

export async function getSupabaseUserLeagues(userId) {
  if (!userId) {
    return [];
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from('league_members')
    .select('league_id')
    .eq('user_id', userId);

  if (membershipsError) {
    console.error('GET_SUPABASE_USER_MEMBERSHIPS_ERROR:', membershipsError);
    throw membershipsError;
  }

  const leagueIds = (memberships || []).map((membership) => membership.league_id);

  if (leagueIds.length === 0) {
    return [];
  }

  const { data: leagues, error: leaguesError } = await supabase
    .from('leagues')
    .select('*')
    .in('id', leagueIds);

  if (leaguesError) {
    console.error('GET_SUPABASE_USER_LEAGUES_ERROR:', leaguesError);
    throw leaguesError;
  }

  const { data: members, error: membersError } = await supabase
    .from('league_members')
    .select('*')
    .in('league_id', leagueIds);

  if (membersError) {
    console.error('GET_SUPABASE_USER_LEAGUE_MEMBERS_ERROR:', membersError);
    throw membersError;
  }

  return (leagues || []).map((league) => {
    const leagueMembers = (members || []).filter(
      (member) => member.league_id === league.id
    );

    return normalizeLeagueFromSupabase(league, leagueMembers);
  });
}

export async function getSupabaseLeagueMembers(leagueId) {
  if (!leagueId) {
    return [];
  }

  const { data, error } = await supabase
    .from('league_members')
    .select('*')
    .eq('league_id', leagueId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('GET_SUPABASE_LEAGUE_MEMBERS_ERROR:', error);
    throw error;
  }

  return (data || []).map((member) => ({
    id: member.user_id,
    uid: member.user_id,
    displayName: member.display_name || 'Usuario',
    email: member.email || '',
    role: member.role || 'member',
    joinedAt: member.joined_at,
  }));
}

export async function updateSupabaseLeaguePrizeSettings({
  leagueId,
  entryFee,
  prizeMode,
}) {
  if (!leagueId) {
    throw new Error('MISSING_LEAGUE_ID');
  }

  const { data, error } = await supabase
    .from('leagues')
    .update({
      entry_fee: Number(entryFee || 0),
      prize_mode: prizeMode || 'fixed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', leagueId)
    .select('*')
    .single();

  if (error) {
    console.error('UPDATE_SUPABASE_LEAGUE_PRIZE_SETTINGS_ERROR:', error);
    throw error;
  }

  return normalizeLeagueFromSupabase(data, []);
}