import axios from 'axios';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { PROD_API_URL, isProd, LOCAL_IP } from './env';

let API_URL;

// Si estamos en modo producción, siempre usamos la URL de Vercel
if (isProd) {
  API_URL = PROD_API_URL;
} else {
  // Configuración dependiendo de la plataforma para desarrollo
  if (Platform.OS === 'web') {
    API_URL = 'http://localhost:5000/api';
  } else if (Platform.OS === 'ios') {
    // Para dispositivos iOS físicos o emulador, usamos la IP local
    API_URL = `http://${LOCAL_IP}:5000/api`;
  } else if (Platform.OS === 'android') {
    // Para emulador de Android usamos 10.0.2.2 (apunta al localhost del host)
    // Para dispositivos físicos Android, usamos la IP local
    const isEmulator = false; // Cambia a true si estás usando el emulador
    API_URL = isEmulator ? 'http://10.0.2.2:5000/api' : `http://${LOCAL_IP}:5000/api`;
  } else {
    API_URL = `http://${LOCAL_IP}:5000/api`;
  }
}

// Para debugging
console.log('API URL configurada como:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función segura para obtener el token de Supabase
const getSupabaseToken = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (error) {
    console.error('Error al obtener token de Supabase:', error);
    return null;
  }
};

// Interceptor que agrega el token de forma segura
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getSupabaseToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error en interceptor de API:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configuración de la API
export const API_CONFIG = {
  // URL base de tu API desplegada en Vercel
  // Reemplaza esta URL con la URL real de tu despliegue
  BASE_URL: 'https://ct-fastapi.vercel.app',
  
  // Endpoints específicos
  ENDPOINTS: {
    WEBPAY: {
      CREATE_TRANSACTION: '/webpay/create-transaction',
      RETURN: '/webpay/return',
      STATUS: '/webpay/status',
      CONFIRM: '/webpay/confirm'
    }
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para hacer fetch con configuración CORS mejorada
export const fetchWithCORS = async (url, options = {}) => {
  const defaultOptions = {
    mode: 'cors',
    credentials: 'omit', // Cambiar de 'include' a 'omit' para evitar problemas de CORS
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': window.location.origin,
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('Error en fetchWithCORS:', error);
    throw error;
  }
};

// URLs específicas para Webpay
export const WEBPAY_URLS = {
  createTransaction: buildApiUrl(API_CONFIG.ENDPOINTS.WEBPAY.CREATE_TRANSACTION),
  return: buildApiUrl(API_CONFIG.ENDPOINTS.WEBPAY.RETURN),
  status: (token) => buildApiUrl(`${API_CONFIG.ENDPOINTS.WEBPAY.STATUS}/${token}`),
  confirm: buildApiUrl(API_CONFIG.ENDPOINTS.WEBPAY.CONFIRM)
};

export { API_URL };
export default api;