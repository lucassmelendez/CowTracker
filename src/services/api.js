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
      // Si el backend envía un mensaje de error, usarlo
      const errorMessage = error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Error en la operación';
      
      return Promise.reject({ 
        status: error.response.status,
        message: errorMessage, 
        data: error.response.data 
      });
    } else if (error.request) {
      console.error('Error de solicitud (no hay respuesta):', error.request);
      return Promise.reject({ 
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.' 
      });
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
  register: (userData) => {
    console.log('API - Datos recibidos para registro:', {
      email: userData.email,
      primer_nombre: userData.primer_nombre,
      primer_apellido: userData.primer_apellido,
      role: userData.role,
      tiene_password: !!userData.password
    });
    
    // Verificación básica
    if (!userData.email || !userData.password || !userData.primer_nombre || !userData.primer_apellido) {
      console.error('Datos incompletos para registro:', { 
        tieneEmail: !!userData.email, 
        tienePassword: !!userData.password,
        tienePrimerNombre: !!userData.primer_nombre,
        tienePrimerApellido: !!userData.primer_apellido
      });
      return Promise.reject({ 
        message: 'Faltan campos obligatorios para el registro' 
      });
    }
    
    // Asegurarse de que los campos opcionales estén presentes
    const datosCompletos = {
      ...userData,
      segundo_nombre: userData.segundo_nombre || '',
      segundo_apellido: userData.segundo_apellido || '',
      role: userData.role || 'user'
    };
    
    console.log('API - Enviando datos al backend:', {
      primer_nombre: datosCompletos.primer_nombre,
      primer_apellido: datosCompletos.primer_apellido,
      email: datosCompletos.email,
      role: datosCompletos.role
    });
    
    // Enviar datos sin transformaciones adicionales
    return instance.post('users/register', datosCompletos)
      .catch(error => {
        console.error('Error detallado en solicitud de registro:', error);
        throw error;
      });
  },
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
  getAllWithFarmInfo: () => instance.get('cattle/with-farm-info'),
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