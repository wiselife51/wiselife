import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sin fallback a propósito: un valor por defecto haría que un entorno mal
// configurado apuntara silenciosamente a la base de datos de producción.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Define VITE_SUPABASE_URL y ' +
      'VITE_SUPABASE_ANON_KEY en tu .env.local (desarrollo) o en la configuracion ' +
      'del entorno en Vercel (preview y produccion).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
