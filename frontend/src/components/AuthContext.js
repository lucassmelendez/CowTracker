import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Cargar usuario guardado localmente al inicio
  useEffect(() => {
    const loadSavedUser = async () => {
      try {
        setLoading(true);
        const savedUserToken = await AsyncStorage.getItem('@user_token');
        const savedUserInfo = await AsyncStorage.getItem('@user_info');
        
        if (savedUserToken && savedUserInfo) {
          const userInfo = JSON.parse(savedUserInfo);
          setUserInfo(userInfo);
          setUser(userInfo);
          api.setAuthToken(savedUserToken);
          
          // Verificar el token en el backend
          try {
            await api.users.verifyToken(savedUserToken);
          } catch (verifyError) {
            console.warn('Token inválido, cerrando sesión');
            await logout();
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedUser();
  }, []);

  // Registro de usuario
  const register = async (name, email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);
      
      const normalizedEmail = email.toLowerCase();
      
      // Registrar a través del backend
      const response = await api.users.register({
        name,
        email: normalizedEmail,
        password,
        role
      });
      
      setUser(response);
      setUserInfo(response);
      
      // Guardar token
      await AsyncStorage.setItem('@user_token', response.token);
      await AsyncStorage.setItem('@user_info', JSON.stringify(response));
      
      api.setAuthToken(response.token);

      router.push('/welcome');

      return response;
    } catch (error) {
      console.error('Error de registro:', error);
      setError(error.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login de usuario
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const normalizedEmail = email.toLowerCase();
      
      // Iniciar sesión a través del backend
      const response = await api.users.login({
        email: normalizedEmail,
        password
      });
      
      setUser(response);
      setUserInfo(response);

      // Guardar token JWT del backend
      await AsyncStorage.setItem('@user_token', response.token);
      await AsyncStorage.setItem('@user_info', JSON.stringify(response));
      
      api.setAuthToken(response.token);

      return response;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      const errorMessage = error.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cierre de sesión
  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('@user_token');
      await AsyncStorage.removeItem('@user_info');
      api.clearAuthToken();
      setUser(null);
      setUserInfo(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verificación de rol
  const hasRole = (role) => {
    if (!userInfo || !userInfo.role) return false;
    
    if (userInfo.role === 'admin') return true;
    
    return userInfo.role === role;
  };

  // Actualización de perfil
  const updateUserProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Actualizar en el backend
      const response = await api.users.updateProfile(data);

      setUser(response);
      setUserInfo(response);
      
      // Actualizar información guardada
      await AsyncStorage.setItem('@user_info', JSON.stringify(response));

      return response;
    } catch (error) {
      setError(error.message || 'Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser: user, // Para mantener compatibilidad con el código existente
    userInfo,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile: updateUserProfile,
    hasRole,
    isAdmin: () => hasRole('admin'),
    isTrabajador: () => hasRole('trabajador'),
    isVeterinario: () => hasRole('veterinario'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;