import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.10:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  try {
    const response = await api.get('/cattle');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener ganado';
  }
};

export const getCattleById = async (id) => {
  try {
    const response = await api.get(`/cattle/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener detalles del ganado';
  }
};

export const createCattle = async (cattleData) => {
  try {
    const response = await api.post('/cattle', cattleData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al crear ganado';
  }
};

export const updateCattle = async (id, cattleData) => {
  try {
    const response = await api.put(`/cattle/${id}`, cattleData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al actualizar ganado';
  }
};

export const deleteCattle = async (id) => {
  try {
    const response = await api.delete(`/cattle/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al eliminar ganado';
  }
};

export const addMedicalRecord = async (id, medicalData) => {
  try {
    const response = await api.post(`/cattle/${id}/medical`, medicalData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al agregar registro médico';
  }
};

export default api; 