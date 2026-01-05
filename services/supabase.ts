import { createClient } from '@supabase/supabase-js';

const SETTINGS_ID = 'b00656af-7387-4228-a4eb-feff86ca10bd';

// Access environment variables via import.meta.env for Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const getRemoteAppSettings = async () => {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('app_settings')
      .select('app_name, logo_url, admin_press_time')
      .eq('id', SETTINGS_ID)
      .single();

    if (error) {
      console.warn('Supabase: Error fetching settings:', error.message);
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
    console.error('Supabase: Unexpected error during fetch:', err);
    return null;
  }
};

export const updateRemoteAppSettings = async (config: { name: string; logoUrl: string | null; adminActivationTime: number }) => {
  try {
    if (!supabase) {
      console.error('Supabase: Client not initialized.');
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
      console.error('Supabase: Error updating settings:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase: Unexpected error during update:', err);
    return false;
  }
};
