import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iwrftvmlookoakmbvffk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cmZ0dm1sb29rb2FrbWJ2ZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTM4NjAsImV4cCI6MjA4NTgyOTg2MH0.um75O0iV1SWG9GmAPkTaTA7aNOWXZrVe8XhHRPCwm2s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
