import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  useEffect(() => {
    const loadSavedUser = async () => {
      try {
        setLoading(true);
        const savedUserToken = await AsyncStorage.getItem('@user_token');
        const savedUserInfo = await AsyncStorage.getItem('@user_info');
        
        if (savedUserToken && savedUserInfo) {
          const userInfoObj = JSON.parse(savedUserInfo);
          setUserInfo(userInfoObj);
          setCurrentUser(userInfoObj);
          api.setAuthToken(savedUserToken);
          
          // Verificar si el token es válido consultando el perfil del usuario
          try {
            const profile = await api.users.getProfile();
            setUserInfo(profile);
            setCurrentUser(profile);
          } catch (profileError) {
            console.error('Error al validar token guardado:', profileError);
            
            // Si hay error, limpiar datos guardados
            await AsyncStorage.removeItem('@user_token');
            await AsyncStorage.removeItem('@user_info');
            setCurrentUser(null);
            setUserInfo(null);
            api.clearAuthToken();
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

  const register = async (name, email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = {
        name,
        email,
        password,
        role
      };
      
      // Realizar registro a través del backend
      const response = await api.users.register(userData);
      
      // Iniciar sesión automáticamente después del registro
      await login(email, password);
      
      router.push('/welcome');
      
      return response;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      if (error.message) {
        setError(error.message);
      } else {
        setError('Error al registrar. Por favor, inténtalo de nuevo.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Iniciar sesión a través del backend
      const response = await api.users.login({ email, password });
      
      // Guardar información del usuario
      setUserInfo(response);
      setCurrentUser(response);
      
      // Guardar token e información en AsyncStorage
      await AsyncStorage.setItem('@user_token', response.token);
      await AsyncStorage.setItem('@user_info', JSON.stringify(response));
      
      // Configurar token para las peticiones
      api.setAuthToken(response.token);
      
      return response;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      if (error.message) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // No es necesario llamar a un endpoint de logout, pero podríamos hacerlo
      // si quisiéramos invalidar tokens en el servidor
      await api.users.logout();
      
      // Limpiar almacenamiento local
      await AsyncStorage.removeItem('@user_token');
      await AsyncStorage.removeItem('@user_info');
      
      // Limpiar estado
      setCurrentUser(null);
      setUserInfo(null);
      
      // Limpiar token en el API
      api.clearAuthToken();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError(error.message || 'Error al cerrar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role) => {
    if (!userInfo || !userInfo.role) return false;
    
    if (userInfo.role === 'admin') return true;
    
    return userInfo.role === role;
  };

  const updateUserProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Actualizar perfil a través del backend
      const updatedUser = await api.users.updateProfile(data);
      
      // Actualizar estado
      setUserInfo(updatedUser);
      setCurrentUser(updatedUser);
      
      // Actualizar información guardada
      await AsyncStorage.setItem('@user_info', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error.message || 'Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;