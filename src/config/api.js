import axios from 'axios';
import { Platform } from 'react-native';

// Configurar URL de la API según la plataforma
let API_URL;

if (Platform.OS === 'web') {
  API_URL = 'http://localhost:5000/api';
} else if (Platform.OS === 'ios') {
  // En iOS, localhost se refiere al dispositivo iOS
  API_URL = 'http://localhost:5000/api';
} else if (Platform.OS === 'android') {
  // En Android, 10.0.2.2 se refiere al localhost de la máquina host
  API_URL = 'http://10.0.2.2:5000/api';
} else {
  // Fallback
  API_URL = 'http://localhost:5000/api';
}

// Para desarrollo, podrías querer usar una IP específica
// API_URL = 'http://192.168.1.X:5000/api'; // Reemplaza con tu IP local

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