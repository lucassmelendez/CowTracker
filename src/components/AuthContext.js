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

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar que userData contenga todos los campos obligatorios
      if (!userData.primer_nombre || !userData.primer_apellido || !userData.email || !userData.password) {
        console.error('Faltan campos obligatorios:', { 
          primer_nombre: userData.primer_nombre, 
          primer_apellido: userData.primer_apellido,
          email: userData.email,
          tiene_password: !!userData.password 
        });
        setError('Por favor complete los campos obligatorios.');
        setLoading(false);
        return;
      }
      
      console.log('AuthContext - Enviando datos en el formato correcto:', {
        primer_nombre: userData.primer_nombre,
        primer_apellido: userData.primer_apellido,
        email: userData.email,
        role: userData.role
      });
      
      const response = await api.users.register(userData);
      console.log('Respuesta de registro recibida:', response);
      
      await login(userData.email, userData.password);
      
      // Utilizar setTimeout para permitir que la navegación ocurra después de que el componente esté montado
      setTimeout(() => {
        try {
          router.push('/(tabs)');
        } catch (navError) {
          console.log('Error de navegación manejado, el usuario ya está autenticado');
          // Intentar navegar a la pantalla principal como alternativa
          try {
            router.push('/');
          } catch (homeNavError) {
            console.log('Error al navegar a la pantalla principal, el usuario está autenticado pero debe navegar manualmente');
          }
        }
      }, 500);
      
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
      
      const response = await api.users.login({ email, password });
      
      setUserInfo(response);
      setCurrentUser(response);
      
      await AsyncStorage.setItem('@user_token', response.token);
      await AsyncStorage.setItem('@user_info', JSON.stringify(response));
      
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
      
      await api.users.logout();
      
      await AsyncStorage.removeItem('@user_token');
      await AsyncStorage.removeItem('@user_info');
      
      setCurrentUser(null);
      setUserInfo(null);
      
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
      
      const updatedUser = await api.users.updateProfile(data);
      
      setUserInfo(updatedUser);
      setCurrentUser(updatedUser);
      
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