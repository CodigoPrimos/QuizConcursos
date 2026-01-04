
import { createClient } from '@supabase/supabase-js';

/**
 * Acesso às variáveis de ambiente usando o padrão do Vite (import.meta.env).
 * O uso de casting para 'any' garante que o código não quebre durante a compilação
 * caso os tipos globais do Vite não estejam carregados no ambiente.
 */
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

/**
 * Inicialização segura do cliente.
 * Só chama createClient se a URL obrigatória estiver presente.
 * Caso contrário, exporta null, o que evita o erro fatal "supabaseUrl is required".
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Busca as configurações globais de forma resiliente.
 * Se o Supabase não estiver disponível (ex: variáveis de ambiente ausentes), 
 * a função retorna null silenciosamente, permitindo que o App use seus fallbacks locais.
 */
export const getRemoteAppSettings = async () => {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized. Check environment variables.');
      return null;
    }

    const { data, error } = await supabase
      .from('app_settings')
      .select('app_name, logo_url, admin_press_time')
      .single();

    if (error) {
      console.warn('Supabase request failed:', error.message);
      return null;
    }

    if (data) {
      return {
        name: data.app_name,
        logoUrl: data.logo_url,
        adminActivationTime: data.admin_press_time
      };
    }
    
    return null;
  } catch (err) {
    console.error('Unexpected error fetching app settings:', err);
    return null;
  }
};
