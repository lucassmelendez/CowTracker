import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Obtener credenciales de Supabase desde variables de entorno
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas correctamente');
}

// Crear diferentes opciones de configuración basadas en la plataforma
let supabaseOptions: any = {};

if (Platform.OS === 'web') {
  // Para web, usamos localStorage en lugar de AsyncStorage
  supabaseOptions = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  };
} else {
  // Para mobile, usamos AsyncStorage
  supabaseOptions = {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  };
}

// Inicializar cliente de Supabase con las opciones apropiadas
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

export { supabase }; 