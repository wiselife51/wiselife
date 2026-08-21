import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
  },
  // Supabase está conectado con variables NEXT_PUBLIC_* en Vercel,
  // mientras que Vite expone por defecto únicamente VITE_* al cliente.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
