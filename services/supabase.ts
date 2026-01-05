import { createClient } from '@supabase/supabase-js';

const SETTINGS_ID = 'b00656af-7387-4228-a4eb-feff86ca10bd';

/**
 * Acesso seguro às variáveis de ambiente do Vite.
 */
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

/**
 * Inicialização condicional para evitar erros fatais se as chaves estiverem ausentes.
 */
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Busca as configurações globais da tabela 'app_settings'.
 */
export const getRemoteAppSettings = async () => {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('app_settings')
      .select('app_name, logo_url, admin_press_time')
      .eq('id', SETTINGS_ID)
      .single();

    if (error) {
      console.warn('Supabase: Erro ao buscar configurações:', error.message);
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
    console.error('Supabase: Erro inesperado no fetch:', err);
    return null;
  }
};

/**
 * Atualiza as configurações no Supabase.
 * Usa exclusivamente UPDATE com o ID fixo b00656af-7387-4228-a4eb-feff86ca10bd.
 */
export const updateRemoteAppSettings = async (config: { name: string; logoUrl: string | null; adminActivationTime: number }) => {
  try {
    if (!supabase) {
      console.error('Supabase: Cliente não inicializado.');
      return false;
    }

    const { error } = await supabase
      .from('app_settings')
      .update({
        app_name: config.name,
        logo_url: config.logoUrl,
        admin_press_time: config.adminActivationTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', SETTINGS_ID);

    if (error) {
      console.error('Supabase: Erro ao atualizar registro:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase: Erro inesperado no update:', err);
    return false;
  }
};
