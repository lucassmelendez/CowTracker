import axios from 'axios';
import { Platform } from 'react-native';

let API_URL;

if (Platform.OS === 'web') {
  API_URL = 'http://localhost:5000/api';
} else if (Platform.OS === 'ios') {
  API_URL = 'http://localhost:5000/api';
} else if (Platform.OS === 'android') {
  API_URL = 'http://10.0.2.2:5000/api';
} else {
  API_URL = 'http://localhost:5000/api';
}

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