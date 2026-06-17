import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .limit(1);

  if (error) {
    console.error('SUPABASE_TEST_ERROR:', error);
    throw error;
  }

  return data;
}