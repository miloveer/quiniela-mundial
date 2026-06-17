import { supabase } from './supabaseClient';

export async function ensureSupabaseProfile(user) {
  if (!user?.uid) {
    throw new Error('USER_NOT_AUTHENTICATED');
  }

  const profileToSave = {
    id: user.uid,
    display_name: user.displayName || user.email || 'Usuario',
    email: user.email || '',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileToSave, {
      onConflict: 'id',
    })
    .select('id, display_name, email')
    .single();

  if (error) {
    console.error('ENSURE_SUPABASE_PROFILE_ERROR:', error);
    throw error;
  }

  return data;
}