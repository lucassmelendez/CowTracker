import axios from 'axios';

// URL base de la API según el entorno
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api' // Para emulador Android
  // ? 'http://localhost:5000/api' // Para desarrollo local
  : 'https://tu-backend-produccion.com/api'; // URL de producción

// Crear instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación a las peticiones
api.interceptors.request.use(
  async (config) => {
    // Obtener el token de AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;