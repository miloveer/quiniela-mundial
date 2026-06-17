import { createClient } from '@supabase/supabase-js';
import { auth } from '../firebase/firebaseConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return null;
    }

    return currentUser.getIdToken();
  },
});