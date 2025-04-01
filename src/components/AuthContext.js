import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../config/firebase';
import { useRouter } from 'expo-router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
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
  const router = useRouter();

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    let isInitialLoad = true;
    
    const loadSavedUser = async () => {
      try {
        const savedUserToken = await AsyncStorage.getItem('@user_token');
        const savedUserInfo = await AsyncStorage.getItem('@user_info');
        
        if (savedUserToken && savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo));
          // Configurar token en el cliente API
          api.setAuthToken(savedUserToken);
        }
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
      }
    };
    
    // Cargar usuario guardado en AsyncStorage primero
    loadSavedUser();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const additionalInfo = await getUserInfo(user.uid);
        setCurrentUser(user);
        setUserInfo(additionalInfo);
        
        // Actualizar datos persistentes
        try {
          const token = await user.getIdToken();
          await AsyncStorage.setItem('@user_token', token);
          await AsyncStorage.setItem('@user_info', JSON.stringify(additionalInfo));
          
          // Configurar token en el cliente API
          api.setAuthToken(token);
        } catch (error) {
          console.error('Error al guardar datos de usuario:', error);
        }
      } else {
        setCurrentUser(null);
        setUserInfo(null);
        
        // Limpiar datos persistentes
        try {
          await AsyncStorage.removeItem('@user_token');
          await AsyncStorage.removeItem('@user_info');
          
          // Limpiar token de API
          api.clearAuthToken();
        } catch (error) {
          console.error('Error al limpiar datos de usuario:', error);
        }
      }
      
      if (isInitialLoad) {
        isInitialLoad = false;
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para registrar un nuevo usuario
  const register = async (name, email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);

      // Convertir email a minúsculas antes de registrar
      const normalizedEmail = email.toLowerCase();
      
      // Registrar usuario con Firebase Auth primero
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Actualizar perfil con el nombre
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Guardar datos adicionales en Firestore
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        email: normalizedEmail,
        role: role,
        createdAt: serverTimestamp(),
      });

      // Establecer el usuario y su información antes de redirigir
      setCurrentUser(userCredential.user);
      setUserInfo({
        uid: userCredential.user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: serverTimestamp(),
      });

      // Redirigir al usuario a la pantalla de bienvenida para crear su primera granja
      router.push('/welcome');

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

      // Convertir email a minúsculas antes de iniciar sesión
      const normalizedEmail = email.toLowerCase();
      
      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Obtener información adicional del usuario
      const additionalInfo = await getUserInfo(userCredential.user.uid);
      setUserInfo(additionalInfo);
      setCurrentUser(userCredential.user);

      // Guardar los datos del usuario en AsyncStorage para persistencia
      await AsyncStorage.setItem('@user_token', await userCredential.user.getIdToken());
      await AsyncStorage.setItem('@user_info', JSON.stringify(additionalInfo));

      return userCredential.user;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      // Manejo específico de errores
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
      } else if (error.code === 'auth/invalid-email') {
        setError('El formato del email es inválido.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Esta cuenta ha sido deshabilitada.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Inténtalo más tarde.');
      } else {
        setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
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
      const userDoc = await getDoc(doc(firestore, 'users', uid));

      if (userDoc.exists()) {
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
  const updateUserProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const { name, email, password } = data;
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Actualizar datos en Firebase Auth
      if (name) {
        await updateProfile(user, {
          displayName: name
        });
      }

      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      if (password) {
        await updatePassword(user, password);
      }

      // Actualizar datos en Firestore
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      await updateDoc(doc(firestore, 'users', user.uid), {
        ...updateData,
        updatedAt: serverTimestamp()
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

  // Valor del contexto
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;