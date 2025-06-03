import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_URL } from '../config/api';
import { 
  RegisterData, 
  LoginCredentials, 
  UserInfo, 
  UpdateProfileData, 
  CattleItem, 
  Farm, 
  MedicalRecord,
  ApiError,
  ApiResponse
} from '../types';

console.log('Configurando API con URL:', API_URL);

// Asegúrate de que la URL base tenga el formato correcto
const baseURL: string = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;

const instance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

instance.interceptors.request.use(
  (config) => {
    console.log('Haciendo solicitud a:', config.url);
    console.log('Método:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para extraer automáticamente los datos
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Respuesta recibida:', response.status, response.statusText);
    // Extraer automáticamente los datos de la respuesta
    return response.data;
  },
  (error) => {
    console.error('Error en respuesta:', error.response?.status, error.response?.statusText);
    
    // Crear un objeto de error más informativo
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
    console.log('Token de autorización configurado');
  } else {
    delete instance.defaults.headers.common['Authorization'];
    console.log('Token de autorización eliminado');
  }
};

const clearAuthToken = (): void => {
  authToken = null;
  delete instance.defaults.headers.common['Authorization'];
  console.log('Token de autorización limpiado');
};

// API para usuarios
const users = {
  register: (userData: RegisterData): Promise<any> => {
    console.log('API - Registrando usuario:', userData.email);
    return instance.post('users/register', userData);
  },

  login: (credentials: LoginCredentials): Promise<UserInfo> => {
    console.log('API - Iniciando sesión para:', credentials.email);
    return instance.post('users/login', credentials);
  },

  logout: (): Promise<void> => {
    console.log('API - Cerrando sesión');
    return instance.post('users/logout');
  },

  getProfile: (): Promise<UserInfo> => {
    console.log('API - Obteniendo perfil de usuario');
    return instance.get('users/profile');
  },

  updateProfile: (data: UpdateProfileData): Promise<UserInfo> => {
    console.log('API - Actualizando perfil de usuario');
    return instance.put('users/profile', data);
  },

  getAll: (): Promise<UserInfo[]> => {
    console.log('API - Obteniendo todos los usuarios');
    return instance.get('users');
  },

  getToken: (): Promise<string> => {
    console.log('API - Solicitando token de autenticación');
    return instance.get('users/refresh-token');
  },

  getPremiumTypes: (): Promise<any[]> => {
    console.log('API - Solicitando tipos de premium');
    return instance.get('users/premium-types');
  },

  updatePremium: (idPremium: number): Promise<any> => {
    console.log(`API - Actualizando premium a ID: ${idPremium}`);
    return instance.put('users/premium', { id_premium: idPremium });
  },
};

// API para ganado
const cattle = {
  getAll: (): Promise<CattleItem[]> => {
    console.log('API - Solicitando todo el ganado');
    return instance.get('cattle');
  },

  getAllWithFarmInfo: (): Promise<CattleItem[]> => {
    console.log('API - Solicitando ganado con información de granjas');
    return instance.get('cattle/with-farm-info');
  },

  getById: (id: string | number): Promise<CattleItem> => {
    console.log(`API - Solicitando ganado con ID: ${id}`);
    return instance.get(`cattle/${id}`);
  },

  create: (cattleData: Partial<CattleItem>): Promise<CattleItem> => {
    console.log('API - Creando nuevo ganado:', cattleData.nombre || cattleData.name);
    return instance.post('cattle', cattleData);
  },

  update: (id: string | number, cattleData: Partial<CattleItem>): Promise<CattleItem> => {
    console.log(`API - Actualizando ganado con ID: ${id}`);
    return instance.put(`cattle/${id}`, cattleData);
  },

  delete: (id: string | number): Promise<void> => {
    console.log(`API - Eliminando ganado con ID: ${id}`);
    return instance.delete(`cattle/${id}`);
  },

  getMedicalRecords: (id: string | number): Promise<MedicalRecord[]> => {
    console.log(`API - Solicitando registros médicos para ganado ID: ${id}`);
    return instance.get(`cattle/${id}/medical-records`);
  },

  addMedicalRecord: (id: string | number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    console.log(`API - Añadiendo registro médico a ganado ID: ${id}`);
    return instance.post(`cattle/${id}/medical`, recordData);
  },
};

// API para granjas
const farms = {
  getAll: (): Promise<Farm[]> => instance.get('farms'),

  getUserFarms: async (): Promise<Farm[]> => {
    console.log('API - Solicitando granjas del usuario con token:', 
      instance.defaults.headers.common['Authorization'] ? 'Presente' : 'Ausente');
    
    try {
      // Si no hay token de autorización, rechazar la petición inmediatamente
      if (!instance.defaults.headers.common['Authorization']) {
        console.error('API - No hay token de autorización para obtener granjas');
        throw new Error('No hay token de autorización');
      }
      
      const response: Farm[] = await instance.get('farms');
      console.log('API - Granjas del usuario recibidas:', response ? response.length : 0);
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
    console.log(`Solicitando ganado para la granja ID: ${id}`);
    
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