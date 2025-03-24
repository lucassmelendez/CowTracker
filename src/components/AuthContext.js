import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '../services/api';

// Bandera para modo desarrollo - para ver todas las pantallas sin iniciar sesión
const DEV_MODE = true; // Cambiar a false para comportamiento normal

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar token almacenado
    const bootstrapAsync = async () => {
      try {
        // En modo desarrollo, establecer un token fake para poder ver todas las pantallas
        if (DEV_MODE) {
          setUserToken('dev-token');
          setUserData({
            _id: 'dev-user-id',
            name: 'Usuario Desarrollo',
            email: 'dev@example.com',
            role: 'admin',
          });
          setIsLoading(false);
          return;
        }
        
        const token = await AsyncStorage.getItem('userToken');
        const user = await AsyncStorage.getItem('userData');
        
        if (token && user) {
          setUserToken(token);
          setUserData(JSON.parse(user));
        }
      } catch (e) {
        console.log('Error al cargar token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    login: async (email, password) => {
      // En modo desarrollo, simular login exitoso inmediatamente
      if (DEV_MODE) {
        setUserToken('dev-token');
        setUserData({
          _id: 'dev-user-id',
          name: 'Usuario Desarrollo',
          email: email || 'dev@example.com',
          role: 'admin',
        });
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await login(email, password);
        
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify({
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
        }));
        
        setUserToken(response.token);
        setUserData({
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
        });
      } catch (e) {
        setError(e.toString());
        console.log('Error al iniciar sesión:', e);
      } finally {
        setIsLoading(false);
      }
    },
    register: async (name, email, password) => {
      // En modo desarrollo, simular registro exitoso inmediatamente
      if (DEV_MODE) {
        setUserToken('dev-token');
        setUserData({
          _id: 'dev-user-id',
          name: name || 'Usuario Desarrollo',
          email: email || 'dev@example.com',
          role: 'admin',
        });
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await register(name, email, password);
        
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify({
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
        }));
        
        setUserToken(response.token);
        setUserData({
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
        });
      } catch (e) {
        setError(e.toString());
        console.log('Error al registrar:', e);
      } finally {
        setIsLoading(false);
      }
    },
    logout: async () => {
      // En modo desarrollo, solo reiniciar el estado sin esperar
      if (DEV_MODE) {
        setUserToken('dev-token');
        setUserData({
          _id: 'dev-user-id',
          name: 'Usuario Desarrollo',
          email: 'dev@example.com',
          role: 'admin',
        });
        return;
      }
      
      setIsLoading(true);
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUserData(null);
      } catch (e) {
        console.log('Error al cerrar sesión:', e);
      } finally {
        setIsLoading(false);
      }
    },
    isLoading,
    userToken,
    userData,
    error,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 