import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../config/firebase';
import api from '../services/api';

// Crear contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isWeb = Platform.OS === 'web';

  // Función para registrar un nuevo usuario
  const register = async (name, email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);

      if (isWeb) {
        // En entorno web, mostramos un mensaje informativo
        setError('La funcionalidad de registro no está disponible en el navegador web. Por favor, usa la aplicación móvil.');
        throw new Error('Funcionalidad no disponible en web');
      }

      // Registrar usuario con Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      // Actualizar perfil con el nombre
      await userCredential.user.updateProfile({
        displayName: name
      });

      // Guardar datos adicionales en Firestore
      await firestore
        .collection('users')
        .doc(userCredential.user.uid)
        .set({
          uid: userCredential.user.uid,
          name: name,
          email: email,
          role: role, // Usar el rol proporcionado
          createdAt: new Date().toISOString(),
        });

      // También registrar en el backend para sincronización
      try {
        await api.post('/users/register', {
          name,
          email,
          password,
          role
        });
      } catch (backendError) {
        console.error('Error al registrar en el backend:', backendError);
        // Continuamos aunque falle el backend, ya que el usuario ya está en Firebase
      }

      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      if (isWeb) {
        // En entorno web, mostramos un mensaje informativo
        setError('La funcionalidad de inicio de sesión no está disponible en el navegador web. Por favor, usa la aplicación móvil.');
        throw new Error('Funcionalidad no disponible en web');
      }

      // Iniciar sesión con Firebase Auth
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      await AsyncStorage.removeItem('@user_token');
      await AsyncStorage.removeItem('@user_info');
      setCurrentUser(null);
      setUserInfo(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener información adicional del usuario desde Firestore
  const getUserInfo = async (uid) => {
    try {
      const userDoc = await firestore
        .collection('users')
        .doc(uid)
        .get();

      if (userDoc.exists) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return null;
    }
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!userInfo || !userInfo.role) return false;
    
    // Si el usuario es admin, tiene acceso a todo
    if (userInfo.role === 'admin') return true;
    
    // Verificar si el usuario tiene el rol específico
    return userInfo.role === role;
  };

  // Función para actualizar el perfil del usuario
  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (isWeb) {
        // En entorno web, mostramos un mensaje informativo
        setError('La funcionalidad de actualización de perfil no está disponible en el navegador web. Por favor, usa la aplicación móvil.');
        throw new Error('Funcionalidad no disponible en web');
      }

      const { name, email, password } = data;
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Actualizar datos en Firebase Auth
      if (name) {
        await user.updateProfile({
          displayName: name
        });
      }

      if (email && email !== user.email) {
        await user.updateEmail(email);
      }

      if (password) {
        await user.updatePassword(password);
      }

      // Actualizar datos en Firestore
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      await firestore
        .collection('users')
        .doc(user.uid)
        .update({
          ...updateData,
          updatedAt: new Date().toISOString()
        });

      // Actualizar información del usuario en el estado
      const updatedUserInfo = await getUserInfo(user.uid);
      setUserInfo(updatedUserInfo);

      return updatedUserInfo;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Efecto para observar cambios en la autenticación
  useEffect(() => {
    if (isWeb) {
      // En entorno web, simplemente establecemos loading en false
      setLoading(false);
      return () => {};
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // Usuario autenticado
          setCurrentUser(user);
          
          // Obtener token para API
          const token = await user.getIdToken();
          await AsyncStorage.setItem('@user_token', token);
          
          // Configurar token en el cliente API
          api.setAuthToken(token);
          
          // Obtener información adicional del usuario desde Firestore
          const userInfo = await getUserInfo(user.uid);
          setUserInfo(userInfo);
          
          // Guardar información del usuario en AsyncStorage
          if (userInfo) {
            await AsyncStorage.setItem('@user_info', JSON.stringify(userInfo));
          }
        } else {
          // Usuario no autenticado
          setCurrentUser(null);
          setUserInfo(null);
          await AsyncStorage.removeItem('@user_token');
          await AsyncStorage.removeItem('@user_info');
          api.clearAuthToken();
        }
      } catch (error) {
        console.error('Error en onAuthStateChanged:', error);
      } finally {
        setLoading(false);
      }
    });

    // Restaurar estado desde AsyncStorage al iniciar
    const restoreUserFromStorage = async () => {
      try {
        const storedUserInfo = await AsyncStorage.getItem('@user_info');
        const storedToken = await AsyncStorage.getItem('@user_token');
        
        if (storedUserInfo && storedToken) {
          setUserInfo(JSON.parse(storedUserInfo));
          api.setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Error al restaurar usuario desde AsyncStorage:', error);
      }
    };

    restoreUserFromStorage();

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, [isWeb]);

  // Valor del contexto
  const value = {
    currentUser,
    userInfo,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    hasRole,
    isAdmin: () => hasRole('admin'),
    isTrabajador: () => hasRole('trabajador'),
    isVeterinario: () => hasRole('veterinario'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;