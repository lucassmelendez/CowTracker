import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  // Función segura para verificar y cargar la sesión de usuario
  const loadUserSession = async () => {
    try {
      setLoading(true);

      // Comprobar si hay una sesión activa en Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error al obtener sesión de Supabase:', error);
        return;
      }
      
      if (data?.session) {
        // Hay una sesión activa, obtener los datos del usuario desde la API
        const token = data.session.access_token;
        api.setAuthToken(token);
        
        try {
          const profile = await api.users.getProfile();
          // Asegurarse de que el token esté incluido en userInfo
          const userInfoWithToken = {
            ...profile,
            token: token
          };
          setUserInfo(userInfoWithToken);
          setCurrentUser(userInfoWithToken);
        } catch (profileError) {
          console.error('Error al obtener perfil de usuario:', profileError);
          
          // Intentar cerrar sesión en Supabase en caso de error
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error('Error al cerrar sesión después de fallo:', signOutError);
          }
          
          api.clearAuthToken();
          setCurrentUser(null);
          setUserInfo(null);
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario guardado:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verifica si la sesión de Supabase está activa al cargar la aplicación
  useEffect(() => {
    loadUserSession();

    // Suscribirse a cambios en la sesión de autenticación de manera segura
    let authSubscription = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            const token = session.access_token;
            api.setAuthToken(token);
            try {
              const profile = await api.users.getProfile();
              // Asegurarse de que el token esté incluido en userInfo
              const userInfoWithToken = {
                ...profile,
                token: token
              };
              setUserInfo(userInfoWithToken);
              setCurrentUser(userInfoWithToken);
            } catch (error) {
              console.error('Error al obtener perfil de usuario:', error);
            }
          } else {
            api.clearAuthToken();
            setCurrentUser(null);
            setUserInfo(null);
          }
        }
      );
      
      authSubscription = data.subscription;
    } catch (error) {
      console.error('Error al suscribirse a cambios de autenticación:', error);
    }

    return () => {
      if (authSubscription) {
        try {
          authSubscription.unsubscribe();
        } catch (error) {
          console.error('Error al cancelar suscripción:', error);
        }
      }
    };
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
      
      // Iniciar sesión con Supabase primero
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      // Obtener token de la sesión de Supabase
      const token = authData.session.access_token;
      
      // Configurar el token en la API
      api.setAuthToken(token);
      
      // Obtener el perfil completo del usuario desde nuestra API
      const response = await api.users.login({ email, password });
      
      // Asegurarse de que el token esté incluido en userInfo
      const userInfoWithToken = {
        ...response,
        token: token // Añadir explícitamente el token
      };
      
      console.log('AuthContext - Usuario autenticado con token:', token.substring(0, 15) + '...');
      
      setUserInfo(userInfoWithToken);
      setCurrentUser(userInfoWithToken);
      
      return userInfoWithToken;
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
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpiar el estado local
      setCurrentUser(null);
      setUserInfo(null);
      
      // Limpiar el token de la API
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
    if (!userInfo || !userInfo.rol) return false;
    
    // Manejar admin: el admin puede hacer todo
    if (userInfo.rol.nombre_rol === 'admin') return true;
    
    // Comprobar rol específico
    return userInfo.rol.nombre_rol === role;
  };

  const updateUserProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await api.users.updateProfile(data);
      
      setUserInfo(updatedUser);
      setCurrentUser(updatedUser);
      
      // Si se actualiza el email, actualizarlo también en Supabase
      if (data.email && data.email !== userInfo.email) {
        const { error } = await supabase.auth.updateUser({
          email: data.email
        });
        
        if (error) throw error;
      }
      
      // Si se actualiza la contraseña, actualizarla también en Supabase
      if (data.password) {
        const { error } = await supabase.auth.updateUser({
          password: data.password
        });
        
        if (error) throw error;
      }
      
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
    isAdmin: () => userInfo?.id_rol === 1 || userInfo?.rol?.nombre_rol === 'admin',
    isTrabajador: () => userInfo?.id_rol === 2 || userInfo?.rol?.nombre_rol === 'user',
    isVeterinario: () => userInfo?.id_rol === 3 || userInfo?.rol?.nombre_rol === 'veterinario',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;