import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { mockCattle, mockFarms } from './mockData';
import * as firestoreService from './firestore';
import { auth } from '../config/firebase';

// En desarrollo, usamos diferentes URLs dependiendo de la plataforma
// - En web y Android emulador: localhost se resuelve al dispositivo host
// - En iOS emulador: localhost se resuelve al propio emulador
// - En dispositivos físicos: necesitamos usar la IP de la máquina de desarrollo
let API_URL;

if (Platform.OS === 'web') {
  API_URL = 'http://localhost:5000/api';
} else if (Platform.OS === 'ios') {
  API_URL = 'http://localhost:5000/api';
} else {
  // Para Android, usamos 10.0.2.2 que apunta al localhost de la máquina host desde el emulador
  API_URL = 'http://10.0.2.2:5000/api';
}

// Para depuración
console.log(`API configurada en: ${API_URL} (${Platform.OS})`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar token a las peticiones
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

// Variable para controlar si debemos usar datos simulados o Firebase
const USE_MOCK_DATA = false; // Cambiado a false para usar Firebase
const USE_FIREBASE = true; // Nueva bandera para usar Firebase en lugar del backend

export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al iniciar sesión';
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/users', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al registrar usuario';
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener perfil';
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al actualizar perfil';
  }
};

export const getAllCattle = async () => {
  // Si estamos en modo simulación, devolvemos los datos simulados
  if (USE_MOCK_DATA) {
    console.log('Usando datos simulados para ganado');
    return mockCattle;
  }

  // Si estamos usando Firebase
  if (USE_FIREBASE) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      console.log('Obteniendo ganado desde Firebase');
      return await firestoreService.getAllCattle(currentUser.uid);
    } catch (error) {
      console.error('Error al obtener ganado desde Firebase:', error);
      // En caso de error, usar datos simulados como fallback
      console.log('Usando datos simulados como fallback');
      return mockCattle;
    }
  }

  // Si no estamos usando Firebase ni datos simulados, usar el backend
  try {
    console.log('Intentando obtener ganado desde:', `${API_URL}/cattle`);
    const response = await api.get('/cattle');
    console.log('Respuesta recibida:', response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    
    // En caso de error de conexión, usar datos simulados como fallback
    console.log('Usando datos simulados como fallback');
    return mockCattle;
  }
};

export const getCattleById = async (id) => {
  if (USE_MOCK_DATA) {
    console.log('Usando datos simulados para detalles de ganado, ID:', id);
    const cattle = mockCattle.find(c => c._id === id);
    if (!cattle) {
      throw 'Ganado no encontrado';
    }
    return cattle;
  }

  // Si estamos usando Firebase
  if (USE_FIREBASE) {
    try {
      console.log('Obteniendo detalles de ganado desde Firebase, ID:', id);
      return await firestoreService.getCattleById(id);
    } catch (error) {
      console.error('Error al obtener detalles de ganado desde Firebase:', error);
      // Intentar usar datos simulados si falla
      const cattle = mockCattle.find(c => c._id === id);
      if (cattle) return cattle;
      throw error;
    }
  }

  // Si no estamos usando Firebase ni datos simulados, usar el backend
  try {
    const response = await api.get(`/cattle/${id}`);
    return response.data;
  } catch (error) {
    // Intentar usar datos simulados si falla la conexión
    if (error.request) {
      const cattle = mockCattle.find(c => c._id === id);
      if (cattle) return cattle;
    }
    throw error.response?.data?.message || 'Error al obtener detalles del ganado';
  }
};

export const createCattle = async (cattleData) => {
  // Si estamos usando Firebase
  if (USE_FIREBASE) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // Agregar el ID del usuario al ganado
      const dataWithUserId = {
        ...cattleData,
        userId: currentUser.uid
      };
      
      return await firestoreService.createCattle(dataWithUserId);
    } catch (error) {
      console.error('Error al crear ganado en Firebase:', error);
      throw error.message || 'Error al crear ganado';
    }
  }
  
  // Si no estamos usando Firebase, usar el backend
  try {
    const response = await api.post('/cattle', cattleData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al crear ganado';
  }
};

export const updateCattle = async (id, cattleData) => {
  // Si estamos usando Firebase
  if (USE_FIREBASE) {
    try {
      return await firestoreService.updateCattle(id, cattleData);
    } catch (error) {
      console.error('Error al actualizar ganado en Firebase:', error);
      throw error.message || 'Error al actualizar ganado';
    }
  }
  
  // Si no estamos usando Firebase, usar el backend
  try {
    const response = await api.put(`/cattle/${id}`, cattleData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al actualizar ganado';
  }
};

export const deleteCattle = async (id) => {
  // Si estamos usando Firebase
  if (USE_FIREBASE) {
    try {
      return await firestoreService.deleteCattle(id);
    } catch (error) {
      console.error('Error al eliminar ganado en Firebase:', error);
      throw error.message || 'Error al eliminar ganado';
    }
  }
  
  // Si no estamos usando Firebase, usar el backend
  try {
    const response = await api.delete(`/cattle/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al eliminar ganado';
  }
};

export const addMedicalRecord = async (id, medicalData) => {
  // Si estamos usando Firebase
  if (USE_FIREBASE) {
    try {
      return await firestoreService.addMedicalRecord(id, medicalData);
    } catch (error) {
      console.error('Error al agregar registro médico en Firebase:', error);
      throw error.message || 'Error al agregar registro médico';
    }
  }
  
  // Si no estamos usando Firebase, usar el backend
  try {
    const response = await api.post(`/cattle/${id}/medical`, medicalData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al agregar registro médico';
  }
};

export default api;