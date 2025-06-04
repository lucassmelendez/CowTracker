import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { 
  ApiConfig,
  RegisterData, 
  LoginCredentials, 
  UserInfo, 
  UpdateProfileData, 
  CattleItem, 
  Farm, 
  MedicalRecord,
  ApiError,
} from '../index';

// ==================== CONFIGURACIÓN DE ENTORNO ====================
// URL del backend en producción (Vercel) - siempre usar esta URL
const PROD_API_URL: string = process.env.EXPO_PUBLIC_PROD_API_URL || 'https://ct-backend-gray.vercel.app/api';

// ==================== CONFIGURACIÓN DE URL ====================
// Siempre usar la URL de producción para evitar problemas de conexión local
const API_URL: string = PROD_API_URL;

// Asegúrate de que la URL base tenga el formato correcto
const baseURL: string = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;

// ==================== CONFIGURACIÓN DE AXIOS ====================
const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// ==================== FUNCIONES DE TOKEN ====================
// Función segura para obtener el token de Supabase
const getSupabaseToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (error) {
    console.error('Error al obtener token de Supabase:', error);
    return null;
  }
};

let authToken: string | null = null;

const setAuthToken = (token: string | null): void => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const clearAuthToken = (): void => {
  authToken = null;
  delete api.defaults.headers.common['Authorization'];
};

// ==================== INTERCEPTORES ====================
// Interceptor de request que agrega el token de forma segura
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      const token = await getSupabaseToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error en interceptor de API:', error);
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para extraer automáticamente los datos
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    const apiError: ApiError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Error desconocido',
      data: error.response?.data
    };
    
    return Promise.reject(apiError);
  }
);

// ==================== SERVICIOS DE API ====================
// API para usuarios
const users = {
  register: (userData: RegisterData): Promise<any> => {
    return api.post('users/register', userData);
  },

  login: (credentials: LoginCredentials): Promise<UserInfo> => {
    return api.post('users/login', credentials);
  },

  logout: (): Promise<void> => {
    return api.post('users/logout');
  },

  getProfile: (): Promise<UserInfo> => {
    return api.get('users/profile');
  },

  updateProfile: (data: UpdateProfileData): Promise<UserInfo> => {
    return api.put('users/profile', data);
  },

  getAll: (): Promise<UserInfo[]> => {
    return api.get('users');
  },

  getToken: (): Promise<string> => {
    return api.get('users/refresh-token');
  },

  getPremiumTypes: (): Promise<any[]> => {
    return api.get('users/premium-types');
  },

  updatePremium: (idPremium: number): Promise<any> => {
    return api.put('users/premium', { id_premium: idPremium });
  },
};

// API para ganado
const cattle = {
  getAll: (): Promise<CattleItem[]> => {
    return api.get('cattle');
  },

  getAllWithFarmInfo: (): Promise<CattleItem[]> => {
    return api.get('cattle/with-farm-info');
  },

  getById: (id: string | number): Promise<CattleItem> => {
    return api.get(`cattle/${id}`);
  },

  create: (cattleData: Partial<CattleItem>): Promise<CattleItem> => {
    return api.post('cattle', cattleData);
  },

  update: (id: string | number, cattleData: Partial<CattleItem>): Promise<CattleItem> => {
    return api.put(`cattle/${id}`, cattleData);
  },

  delete: (id: string | number): Promise<void> => {
    return api.delete(`cattle/${id}`);
  },

  getMedicalRecords: (id: string | number): Promise<MedicalRecord[]> => {
    return api.get(`cattle/${id}/medical-records`);
  },

  addMedicalRecord: (id: string | number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    return api.post(`cattle/${id}/medical`, recordData);
  },
};

// API para granjas
const farms = {
  getAll: (): Promise<Farm[]> => api.get('farms'),

  getUserFarms: async (): Promise<Farm[]> => {
    try {
      if (!api.defaults.headers.common['Authorization']) {
        console.error('API - No hay token de autorización para obtener granjas');
        throw new Error('No hay token de autorización');
      }
      
      const response: Farm[] = await api.get('farms');
      return response;
    } catch (error) {
      console.error('API - Error al obtener granjas del usuario:', error);
      throw error;
    }
  },

  getById: (id: string): Promise<Farm> => api.get(`farms/${id}`),

  create: (farmData: Partial<Farm>): Promise<Farm> => api.post('farms', farmData),

  update: (id: string, farmData: Partial<Farm>): Promise<Farm> => 
    api.put(`farms/${id}`, farmData),

  delete: (id: string): Promise<void> => api.delete(`farms/${id}`),

  // Relaciones con ganado
  getCattle: (id: string): Promise<CattleItem[]> => {
    if (!id) {
      console.error('ID de granja no proporcionado');
      return Promise.resolve([]);
    }
    
    return api.get(`farms/${id}/cattle`);
  },
  
  // Relaciones con trabajadores
  getWorkers: (id: string): Promise<UserInfo[]> => api.get(`farms/${id}/workers`),
  
  addWorker: (id: string, workerId: string): Promise<any> => 
    api.post(`farms/${id}/workers`, { workerId }),
  
  removeWorker: (id: string, workerId: string): Promise<void> => 
    api.delete(`farms/${id}/workers/${workerId}`),
  
  // Relaciones con veterinarios
  getVeterinarians: (id: string): Promise<UserInfo[]> => api.get(`farms/${id}/veterinarians`),
  
  addVeterinarian: (id: string, vetId: string): Promise<any> => 
    api.post(`farms/${id}/veterinarians`, { vetId }),
  
  removeVeterinarian: (id: string, vetId: string): Promise<void> => 
    api.delete(`farms/${id}/veterinarians/${vetId}`),
};

// ==================== CONFIGURACIÓN ADICIONAL ====================
// Configuración de la API para servicios externos (Webpay, etc.)
export const API_CONFIG: ApiConfig = {
  // URL base de tu API desplegada en Vercel
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
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para hacer fetch con configuración CORS mejorada
export const fetchWithCORS = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const defaultOptions: RequestInit = {
    mode: 'cors',
    credentials: 'omit', // Cambiar de 'include' a 'omit' para evitar problemas de CORS
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': typeof window !== 'undefined' ? window.location.origin : '',
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
  status: (token: string): string => buildApiUrl(`${API_CONFIG.ENDPOINTS.WEBPAY.STATUS}/${token}`),
  confirm: buildApiUrl(API_CONFIG.ENDPOINTS.WEBPAY.CONFIRM)
};

// ==================== EXPORTACIONES ====================
// Objeto principal de la API con todos los servicios
const apiService = {
  setAuthToken,
  clearAuthToken,
  users,
  cattle,
  farms,
  get: (url: string, config?: any) => api.get(url, config),
  post: (url: string, data?: any, config?: any) => api.post(url, data, config),
  put: (url: string, data?: any, config?: any) => api.put(url, data, config),
  delete: (url: string, config?: any) => api.delete(url, config),
};

// Exportar también las constantes de configuración
export { API_URL, PROD_API_URL };
export default apiService; 