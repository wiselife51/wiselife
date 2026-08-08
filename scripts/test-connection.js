import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwrftvmlookoakmbvffk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cmZ0dm1sb29rb2FrbWJ2ZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTM4NjAsImV4cCI6MjA4NTgyOTg2MH0.um75O0iV1SWG9GmAPkTaTA7aNOWXZrVe8XhHRPCwm2s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runFullDiagnostics() {
  console.log('====================================================');
  console.log('       DIAGNÓSTICO DE CONEXIÓN A SUPABASE           ');
  console.log('====================================================');
  console.log(`📡 URL del Proyecto: ${supabaseUrl}`);
  console.log(`🔑 Clave Anónima: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log('----------------------------------------------------');

  const tablesToTest = [
    'psychologists',
    'profiles',
    'clinical_records',
    'session_notes',
    'appointments',
    'payment_transactions',
    'testimonials'
  ];

  // 1. Prueba de Auth
  try {
    const authStart = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const authTime = Date.now() - authStart;
    if (error) {
      console.log(`❌ Auth Service: Error (${error.message})`);
    } else {
      console.log(`✅ Servicio de Autenticación: ONLINE (${authTime} ms)`);
    }
  } catch (err) {
    console.log(`❌ Servicio de Autenticación: ERROR GRAVE (${err.message})`);
  }

  console.log('----------------------------------------------------');
  console.log('🔍 PROBANDO ACCESO A TABLAS (REST API / POSTGRES):');
  console.log('----------------------------------------------------');

  for (const table of tablesToTest) {
    try {
      const start = Date.now();
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      const latency = Date.now() - start;

      if (error) {
        console.log(`⚠️  Tabla "${table}": ERROR (${error.message}) [${latency} ms]`);
      } else {
        const rowCount = count !== null ? count : data?.length;
        console.log(`✅ Tabla "${table}": OK - ${rowCount} filas detectadas [${latency} ms]`);
      }
    } catch (err) {
      console.log(`❌ Tabla "${table}": FALLO DE RED / EXCEPCIÓN (${err.message})`);
    }
  }

  console.log('====================================================');
  console.log('       PRUEBAS DE CONEXIÓN FINALIZADAS              ');
  console.log('====================================================\n');
}

runFullDiagnostics();
