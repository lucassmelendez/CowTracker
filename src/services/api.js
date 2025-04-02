import axios from 'axios';
import { API_URL } from '../config/api';

console.log('Configurando API con URL:', API_URL);

// Asegúrate de que la URL base tenga el formato correcto
const baseURL = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

instance.interceptors.request.use(
  (config) => {
    console.log('Haciendo solicitud a:', config.url);
    console.log('Método:', config.method.toUpperCase());
    console.log('Headers:', JSON.stringify(config.headers));
    
    return config;
  },
  (error) => {
    console.error('Error en solicitud:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida con éxito de:', response.config.url);
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('Error de respuesta:', error.response.status, error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error('Error de solicitud (no hay respuesta):', error.request);
      return Promise.reject({ message: 'No se pudo conectar con el servidor' });
    } else {
      console.error('Error en la configuración:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

let authToken = null;

const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token configurado en API:', token.substring(0, 15) + '...');
  } else {
    delete instance.defaults.headers.common['Authorization'];
    console.log('Token eliminado de API');
  }
};

const clearAuthToken = () => {
  authToken = null;
  delete instance.defaults.headers.common['Authorization'];
  console.log('Token eliminado (clearAuthToken)');
};

// API para usuarios
const users = {
  register: (userData) => instance.post('users/register', userData),
  login: (credentials) => instance.post('users/login', credentials),
  getProfile: () => instance.get('users/profile'),
  updateProfile: (userData) => instance.put('users/profile', userData),
  getAll: () => instance.get('users'),
  changeRole: (userId, role) => instance.put(`users/${userId}/role`, { role }),
  logout: () => {
    clearAuthToken();
    return Promise.resolve();
  },
  refreshToken: async () => {
    const token = await instance.post('users/refresh-token');
    if (token) {
      setAuthToken(token);
    }
    return token;
  }
};

// API para ganado
const cattle = {
  getAll: () => instance.get('cattle'),
  getById: (id) => instance.get(`cattle/${id}`),
  create: (cattleData) => instance.post('cattle', cattleData),
  update: (id, cattleData) => instance.put(`cattle/${id}`, cattleData),
  delete: (id) => instance.delete(`cattle/${id}`),
  getMedicalRecords: (id) => instance.get(`cattle/${id}/medical-records`),
  addMedicalRecord: (id, recordData) => instance.post(`cattle/${id}/medical`, recordData),
};

// API para granjas
const farms = {
  getAll: () => instance.get('farms'),
  getById: (id) => instance.get(`farms/${id}`),
  create: (farmData) => instance.post('farms', farmData),
  update: (id, farmData) => instance.put(`farms/${id}`, farmData),
  delete: (id) => instance.delete(`farms/${id}`),
  
  // Relaciones con ganado
  getCattle: (id) => instance.get(`farms/${id}/cattle`),
  
  // Relaciones con trabajadores
  getWorkers: (id) => instance.get(`farms/${id}/workers`),
  addWorker: (id, workerId) => instance.post(`farms/${id}/workers`, { workerId }),
  removeWorker: (id, workerId) => instance.delete(`farms/${id}/workers/${workerId}`),
  
  // Relaciones con veterinarios
  getVeterinarians: (id) => instance.get(`farms/${id}/veterinarians`),
  addVeterinarian: (id, vetId) => instance.post(`farms/${id}/veterinarians`, { vetId }),
  removeVeterinarian: (id, vetId) => instance.delete(`farms/${id}/veterinarians/${vetId}`),
};

const api = {
  setAuthToken,
  clearAuthToken,
  users,
  cattle,
  farms,
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  delete: (url, config) => instance.delete(url, config),
};

export default api;