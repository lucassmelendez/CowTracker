import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Obtener credenciales de Supabase desde variables de entorno
const supabaseUrl = 'https://eisceuexbwpdpjxuskgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2NldWV4YndwZHBqeHVza2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTM3MzgsImV4cCI6MjA2NDEyOTczOH0.B-xDkrbShC76GwQ1p4poZzdcppxh1u95s24XRz185KE';

// Inicializar cliente de Supabase con soporte para AsyncStorage para mantener la sesión
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ Cliente de Supabase inicializado en el frontend');

export { supabase }; 