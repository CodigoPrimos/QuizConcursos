
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // A Gemini SDK exige process.env.API_KEY disponível no escopo global
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    
    // Garantindo que o Vite processe corretamente as variáveis VITE_ via import.meta.env.
    // Injetamos as chaves fornecidas como fallbacks estáticos para garantir que o preview funcione.
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://ncckxdouyrvqwsehsbij.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY2t4ZG91eXJ2cXdzZWhzYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NjMzMDEsImV4cCI6MjA4MzEzOTMwMX0.DcMPlMN5mPsCU0Yy7mW59uvklWghIVucQafj7laElSU')
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
