import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_URL } from '../config/api';
import { supabase } from '../config/supabase'; // Importar supabase
import { 
  RegisterData, 
  LoginCredentials, 
  UserInfo, 
  UpdateProfileData, 
  CattleItem, 
  Farm, 
  MedicalRecord,
  ApiError,
} from '../types';
// Asegúrate de que la URL base tenga el formato correcto
const baseURL: string = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;

const instance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

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

// Interceptor de petición que agrega el token de Supabase automáticamente
instance.interceptors.request.use(
  async (config) => {
    try {
        const token = await getSupabaseToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
        console.log('No se encontró token de Supabase para la petición');
      }
    } catch (error) {
      console.error('Error en interceptor de petición:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para extraer automáticamente los datos
instance.interceptors.response.use(
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

let authToken: string | null = null;

const setAuthToken = (token: string | null): void => {
  authToken = token;
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
};

const clearAuthToken = (): void => {
  authToken = null;
  delete instance.defaults.headers.common['Authorization'];
};

// API para usuarios
const users = {
  register: (userData: RegisterData): Promise<any> => {
    return instance.post('users/register', userData);
  },

  login: (credentials: LoginCredentials): Promise<UserInfo> => {
    return instance.post('users/login', credentials);
  },

  logout: (): Promise<void> => {
    return instance.post('users/logout');
  },

  getProfile: (): Promise<UserInfo> => {
    return instance.get('users/profile');
  },

  updateProfile: (data: UpdateProfileData): Promise<UserInfo> => {
    return instance.put('users/profile', data);
  },

  getAll: (): Promise<UserInfo[]> => {
    return instance.get('users');
  },

  getToken: (): Promise<string> => {
    return instance.get('users/refresh-token');
  },

  getPremiumTypes: (): Promise<any[]> => {
    return instance.get('users/premium-types');
  },

  updatePremium: (idPremium: number): Promise<any> => {
    return instance.put('users/premium', { id_premium: idPremium });
  },
};

// API para ganado
const cattle = {
  getAll: (): Promise<CattleItem[]> => {
    return instance.get('cattle');
  },

  getAllWithFarmInfo: (): Promise<CattleItem[]> => {
    return instance.get('cattle/with-farm-info');
  },

  getById: (id: string | number): Promise<CattleItem> => {
    return instance.get(`cattle/${id}`);
  },

  create: (cattleData: Partial<CattleItem>): Promise<CattleItem> => {
    return instance.post('cattle', cattleData);
  },

  update: (id: string | number, cattleData: Partial<CattleItem>): Promise<CattleItem> => {
    return instance.put(`cattle/${id}`, cattleData);
  },

  delete: (id: string | number): Promise<void> => {
    return instance.delete(`cattle/${id}`);
  },

  getMedicalRecords: (id: string | number): Promise<MedicalRecord[]> => {
    return instance.get(`cattle/${id}/medical-records`);
  },

  addMedicalRecord: (id: string | number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    return instance.post(`cattle/${id}/medical`, recordData);
  },
};

// API para granjas
const farms = {
  getAll: (): Promise<Farm[]> => instance.get('farms'),

  getUserFarms: async (): Promise<Farm[]> => {
    try {
      if (!instance.defaults.headers.common['Authorization']) {
        console.error('API - No hay token de autorización para obtener granjas');
        throw new Error('No hay token de autorización');
      }
      
      const response: Farm[] = await instance.get('farms');
      return response;
    } catch (error) {
      console.error('API - Error al obtener granjas del usuario:', error);
      throw error;
    }
  },

  getById: (id: string): Promise<Farm> => instance.get(`farms/${id}`),

  create: (farmData: Partial<Farm>): Promise<Farm> => instance.post('farms', farmData),

  update: (id: string, farmData: Partial<Farm>): Promise<Farm> => 
    instance.put(`farms/${id}`, farmData),

  delete: (id: string): Promise<void> => instance.delete(`farms/${id}`),

  // Relaciones con ganado
  getCattle: (id: string): Promise<CattleItem[]> => {
    if (!id) {
      console.error('ID de granja no proporcionado');
      return Promise.resolve([]);
    }
    
    return instance.get(`farms/${id}/cattle`);
  },
  
  // Relaciones con trabajadores
  getWorkers: (id: string): Promise<UserInfo[]> => instance.get(`farms/${id}/workers`),
  
  addWorker: (id: string, workerId: string): Promise<any> => 
    instance.post(`farms/${id}/workers`, { workerId }),
  
  removeWorker: (id: string, workerId: string): Promise<void> => 
    instance.delete(`farms/${id}/workers/${workerId}`),
  
  // Relaciones con veterinarios
  getVeterinarians: (id: string): Promise<UserInfo[]> => instance.get(`farms/${id}/veterinarians`),
  
  addVeterinarian: (id: string, vetId: string): Promise<any> => 
    instance.post(`farms/${id}/veterinarians`, { vetId }),
  
  removeVeterinarian: (id: string, vetId: string): Promise<void> => 
    instance.delete(`farms/${id}/veterinarians/${vetId}`),
};

const api = {
  setAuthToken,
  clearAuthToken,
  users,
  cattle,
  farms,
  get: (url: string, config?: any) => instance.get(url, config),
  post: (url: string, data?: any, config?: any) => instance.post(url, data, config),
  put: (url: string, data?: any, config?: any) => instance.put(url, data, config),
  delete: (url: string, config?: any) => instance.delete(url, config),
};

export default api; 