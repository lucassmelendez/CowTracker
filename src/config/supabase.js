import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Obtener credenciales de Supabase desde variables de entorno
const supabaseUrl = 'https://eisceuexbwpdpjxuskgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2NldWV4YndwZHBqeHVza2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTM3MzgsImV4cCI6MjA2NDEyOTczOH0.B-xDkrbShC76GwQ1p4poZzdcppxh1u95s24XRz185KE';

// Crear diferentes opciones de configuración basadas en la plataforma
let supabaseOptions = {};

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
const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

console.log('✅ Cliente de Supabase inicializado en el frontend');

export { supabase }; 