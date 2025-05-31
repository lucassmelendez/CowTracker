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
  getAll: () => {
    console.log('API - Solicitando todo el ganado');
    return instance.get('cattle')
      .then(response => {
        console.log(`API - Se recibieron ${Array.isArray(response) ? response.length : 'datos'} de ganado`);
        return response;
      })
      .catch(error => {
        console.error('Error al obtener ganado:', error);
        return []; // En caso de error, devolver array vacío
      });
  },
  getAllWithFarmInfo: () => {
    console.log('API - Solicitando ganado con información de granjas');
    return instance.get('cattle/with-farm-info')
      .catch(error => {
        console.error('Error al obtener ganado con info de granjas:', error);
        return []; // En caso de error, devolver array vacío
      });
  },
  getById: (id) => {
    console.log(`API - Solicitando ganado con ID: ${id}`);
    return instance.get(`cattle/${id}`)
      .catch(error => {
        console.error(`Error al obtener ganado con ID ${id}:`, error);
        throw error; // Propagar el error
      });
  },
  create: (cattleData) => {
    console.log('API - Creando nuevo ganado:', cattleData.nombre || cattleData.name);
    return instance.post('cattle', cattleData)
      .catch(error => {
        console.error('Error al crear ganado:', error);
        throw error; // Propagar el error
      });
  },
  update: (id, cattleData) => {
    console.log(`API - Actualizando ganado con ID: ${id}`);
    return instance.put(`cattle/${id}`, cattleData)
      .catch(error => {
        console.error(`Error al actualizar ganado con ID ${id}:`, error);
        throw error; // Propagar el error
      });
  },
  delete: (id) => {
    console.log(`API - Eliminando ganado con ID: ${id}`);
    return instance.delete(`cattle/${id}`)
      .catch(error => {
        console.error(`Error al eliminar ganado con ID ${id}:`, error);
        throw error; // Propagar el error
      });
  },
  getMedicalRecords: (id) => {
    console.log(`API - Solicitando registros médicos para ganado ID: ${id}`);
    return instance.get(`cattle/${id}/medical-records`)
      .catch(error => {
        console.error(`Error al obtener registros médicos para ganado ID ${id}:`, error);
        return []; // En caso de error, devolver array vacío
      });
  },
  addMedicalRecord: (id, recordData) => {
    console.log(`API - Añadiendo registro médico a ganado ID: ${id}`);
    return instance.post(`cattle/${id}/medical`, recordData)
      .catch(error => {
        console.error(`Error al añadir registro médico a ganado ID ${id}:`, error);
        throw error; // Propagar el error
      });
  },
};

// API para granjas
const farms = {
  getAll: () => instance.get('farms'),
  getUserFarms: async () => {
    console.log('API - Solicitando granjas del usuario con token:', 
      instance.defaults.headers.common['Authorization'] ? 'Presente' : 'Ausente');
    
    try {
      // Si no hay token de autorización, rechazar la petición inmediatamente
      if (!instance.defaults.headers.common['Authorization']) {
        console.error('API - No hay token de autorización para obtener granjas');
        throw new Error('No hay token de autorización');
      }
      
      const response = await instance.get('farms');
      console.log('API - Granjas del usuario recibidas:', response ? response.length : 0);
      return response;
    } catch (error) {
      console.error('API - Error al obtener granjas del usuario:', error);
      throw error;
    }
  },
  getById: (id) => instance.get(`farms/${id}`),
  create: (farmData) => instance.post('farms', farmData),
  update: (id, farmData) => instance.put(`farms/${id}`, farmData),
  delete: (id) => instance.delete(`farms/${id}`),
  // Relaciones con ganado
  getCattle: (id) => {
    console.log(`Solicitando ganado para la granja ID: ${id}`);
    
    if (!id) {
      console.error('ID de granja no proporcionado');
      return Promise.resolve({ data: [] });
    }
    
    return instance.get(`farms/${id}/cattle`)
      .then(response => {
        // Validar la respuesta
        if (!response) {
          console.warn(`Respuesta vacía para ganado de granja ${id}`);
          return { data: [] };
        }
        
        // Si la respuesta contiene error, devolver un array vacío
        if (response.error || response.message?.toLowerCase().includes('error')) {
          console.warn(`Error en respuesta para ganado de granja ${id}:`, response.error || response.message);
          return { data: [] };
        }
        
        // Asegurarnos de que la respuesta siempre tenga un formato consistente
        if (Array.isArray(response)) {
          return { data: response };
        } else if (response.data && Array.isArray(response.data)) {
          return response;
        } else {
          console.warn(`Formato inesperado en respuesta de granja ${id}:`, response);
          return { data: [] };
        }
      })
      .catch(error => {
        console.error(`Error al obtener ganado para granja ${id}:`, error);
        // En caso de error, devolver un array vacío para evitar errores en la UI
        return { data: [] };
      });
  },
  
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