import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/services/api';
import { supabase } from '../lib/config/supabase';
import { useCacheCleanup } from '../hooks/useCacheCleanup';

interface UserRole {
  id_rol: number;
  nombre_rol: string;
}

interface UserInfo {
  uid?: string;
  id?: number;
  id_rol?: number;
  primer_nombre?: string;
  primer_apellido?: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  email: string;
  name?: string;
  displayName?: string;
  token?: string;
  rol?: UserRole;
  id_premium?: number;
  premium_type?: string;
}

interface RegisterData {
  primer_nombre: string;
  primer_apellido: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  email: string;
  password: string;
  role?: string;
}

interface UpdateProfileData {
  primer_nombre?: string;
  primer_apellido?: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  email?: string;
  password?: string;
  id_premium?: number;
  is_premium?: boolean;
}

interface AuthContextType {
  currentUser: UserInfo | null;
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
  register: (userData: RegisterData) => Promise<any>;
  login: (email: string, password: string) => Promise<UserInfo>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<UserInfo>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isTrabajador: () => boolean;
  isVeterinario: () => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { clearAllUserData } = useCacheCleanup();

  // Función segura para verificar y cargar la sesión de usuario
  const loadUserSession = async (): Promise<void> => {
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
          const profile = await api.users.getProfile(); // Ya no necesita .data
          // Asegurarse de que el token esté incluido en userInfo
          const userInfoWithToken: UserInfo = {
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
    let authSubscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            const token = session.access_token;
            api.setAuthToken(token);
            try {
              const profile = await api.users.getProfile(); // Ya no necesita .data
              // Asegurarse de que el token esté incluido en userInfo
              const userInfoWithToken: UserInfo = {
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

  const register = async (userData: RegisterData): Promise<any> => {
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
      
      const response = await api.users.register(userData);
      
      await login(userData.email, userData.password);
      
      // Utilizar setTimeout para permitir que la navegación ocurra después de que el componente esté montado
      setTimeout(() => {
        try {
          router.push('/(tabs)');
        } catch (navError) {
          // Intentar navegar a la pantalla principal como alternativa
          try {
            router.push('/');
          } catch (homeNavError) {
          }
        }
      }, 500);
      
      return response;
    } catch (error: any) {
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

  const login = async (email: string, password: string): Promise<UserInfo> => {
    try {
      setLoading(true);
      setError(null);
      
      // Limpiar datos del usuario anterior antes de hacer login
      await clearAllUserData();
      console.log('Datos del usuario anterior limpiados');
      
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
      const response = await api.users.login({ email, password }); // Ya no necesita .data
      
      // Asegurarse de que el token esté incluido en userInfo
      const userInfoWithToken: UserInfo = {
        ...response,
        token: token // Añadir explícitamente el token
      };
      
      setUserInfo(userInfoWithToken);
      setCurrentUser(userInfoWithToken);
      
      return userInfoWithToken;
    } catch (error: any) {
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

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Iniciando proceso de logout...');
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Sesión cerrada en Supabase');
      
      // Limpiar el estado local
      setCurrentUser(null);
      setUserInfo(null);
      
      // Limpiar el token de la API
      api.clearAuthToken();
      console.log('Token de API limpiado');
      
      // Limpiar completamente todos los datos del usuario
      await clearAllUserData();
      
      console.log('Logout completado exitosamente');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      setError(error.message || 'Error al cerrar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    if (!userInfo || !userInfo.rol) return false;
    
    // Manejar admin: el admin puede hacer todo
    if (userInfo.rol.nombre_rol === 'admin') return true;
    
    // Comprobar rol específico
    return userInfo.rol.nombre_rol === role;
  };

  const updateUserProfile = async (data: UpdateProfileData): Promise<UserInfo> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await api.users.updateProfile(data); // Ya no necesita .data
      
      setUserInfo(updatedUser);
      setCurrentUser(updatedUser);
      
      // Si se actualiza el email, actualizarlo también en Supabase
      if (data.email && data.email !== userInfo?.email) {
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
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setError(error.message || 'Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
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