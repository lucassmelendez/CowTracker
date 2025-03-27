import axios from 'axios';
import { API_URL } from '../config/api';

// Crear instancia de axios con configuración base
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Manejar errores específicos
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('Error de solicitud:', error.request);
      return Promise.reject({ message: 'No se pudo conectar con el servidor' });
    } else {
      // Algo ocurrió al configurar la solicitud
      console.error('Error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

// Funciones para gestionar el token de autenticación
let authToken = null;

const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
};

const clearAuthToken = () => {
  authToken = null;
  delete instance.defaults.headers.common['Authorization'];
};

// API para usuarios
const users = {
  register: (userData) => instance.post('/users/register', userData),
  login: (credentials) => instance.post('/users/login', credentials),
  getProfile: () => instance.get('/users/profile'),
  updateProfile: (userData) => instance.put('/users/profile', userData),
  getAll: () => instance.get('/users'),
  changeRole: (userId, role) => instance.put(`/users/${userId}/role`, { role }),
};

// API para ganado
const cattle = {
  getAll: () => instance.get('/cattle'),
  getById: (id) => instance.get(`/cattle/${id}`),
  create: (cattleData) => instance.post('/cattle', cattleData),
  update: (id, cattleData) => instance.put(`/cattle/${id}`, cattleData),
  delete: (id) => instance.delete(`/cattle/${id}`),
  getMedicalRecords: (id) => instance.get(`/cattle/${id}/medical-records`),
  addMedicalRecord: (id, recordData) => instance.post(`/cattle/${id}/medical-records`, recordData),
};

// API para granjas
const farms = {
  getAll: () => instance.get('/farms'),
  getById: (id) => instance.get(`/farms/${id}`),
  create: (farmData) => instance.post('/farms', farmData),
  update: (id, farmData) => instance.put(`/farms/${id}`, farmData),
  delete: (id) => instance.delete(`/farms/${id}`),
};

// Exportar API
const api = {
  setAuthToken,
  clearAuthToken,
  users,
  cattle,
  farms,
  // Método para solicitudes personalizadas
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  delete: (url, config) => instance.delete(url, config),
};

export default api;