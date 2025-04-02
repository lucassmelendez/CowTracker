import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tu IP real en la red local
const LOCAL_IP = '192.168.1.84'; // Obtenida de ipconfig

let API_URL;

// Configuración dependiendo de la plataforma
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

// Para debugging
console.log('API URL configurada como:', API_URL);

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

export { API_URL };
export default api;