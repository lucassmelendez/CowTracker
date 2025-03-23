import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '../services/api';

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