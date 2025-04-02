import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de producción del backend (cuando se despliega en Vercel u otro servicio)
const PRODUCTION_API_URL = 'https://tu-backend-url.vercel.app/api'; // Cambiar por la URL real después del despliegue

// URLs de desarrollo para diferentes plataformas
const DEV_API_URLS = {
  web: 'http://localhost:5000/api',
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api'
};

// Determinar si estamos en producción o desarrollo
// Puedes cambiar esta variable manualmente o configurarla con variables de entorno
const IS_PRODUCTION = false; // Cambia a true cuando despliegues a producción

// Seleccionar la URL adecuada
let API_URL;
if (IS_PRODUCTION) {
  API_URL = PRODUCTION_API_URL;
} else {
  API_URL = DEV_API_URLS[Platform.OS] || DEV_API_URLS.default;
}

export { API_URL };

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
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