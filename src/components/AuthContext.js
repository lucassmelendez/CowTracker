import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../config/firebase';
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

  // Función para registrar un nuevo usuario
  const register = async (name, email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);

      if (isWeb) {
        // En entorno web, usamos un flujo simulado para demostración
        console.log('Registro en modo demostración (web)');
        
        // Simular un retraso para la demostración
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Crear un usuario simulado
        const mockUser = {
          uid: 'demo-' + Date.now(),
          email,
          displayName: name,
        };
        
        // Guardar en localStorage para persistencia en la sesión
        await AsyncStorage.setItem('@demo_user', JSON.stringify(mockUser));
        await AsyncStorage.setItem('@demo_user_info', JSON.stringify({
          uid: mockUser.uid,
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        }));
        
        setCurrentUser(mockUser);
        setUserInfo({
          uid: mockUser.uid,
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        });
        
        return mockUser;
      }

      // Registrar usuario con Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con el nombre
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Guardar datos adicionales en Firestore
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        role: role, // Usar el rol proporcionado
        createdAt: serverTimestamp(),
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
        // En entorno web, usamos un flujo simulado para demostración
        console.log('Login en modo demostración (web)');
        
        // Simular un retraso para la demostración
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar si hay un usuario demo registrado
        const demoUser = await AsyncStorage.getItem('@demo_user');
        const demoUserInfo = await AsyncStorage.getItem('@demo_user_info');
        
        if (demoUser && JSON.parse(demoUser).email === email) {
          // Si el email coincide con el usuario demo registrado
          const mockUser = JSON.parse(demoUser);
          setCurrentUser(mockUser);
          setUserInfo(JSON.parse(demoUserInfo));
          return mockUser;
        }
        
        // Si no hay usuario demo o el email no coincide, crear uno nuevo
        const mockUser = {
          uid: 'demo-' + Date.now(),
          email,
          displayName: email.split('@')[0],
        };
        
        // Guardar en localStorage para persistencia en la sesión
        await AsyncStorage.setItem('@demo_user', JSON.stringify(mockUser));
        await AsyncStorage.setItem('@demo_user_info', JSON.stringify({
          uid: mockUser.uid,
          name: email.split('@')[0],
          email,
          role: 'user',
          createdAt: new Date().toISOString(),
        }));
        
        setCurrentUser(mockUser);
        setUserInfo({
          uid: mockUser.uid,
          name: email.split('@')[0],
          email,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
        
        return mockUser;
      }

      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
      
      if (isWeb) {
        // En entorno web, simplemente limpiamos el estado y el localStorage
        await AsyncStorage.removeItem('@demo_user');
        await AsyncStorage.removeItem('@demo_user_info');
        setCurrentUser(null);
        setUserInfo(null);
        return;
      }
      
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
      if (isWeb) {
        // En entorno web, devolvemos la información del localStorage
        const demoUserInfo = await AsyncStorage.getItem('@demo_user_info');
        if (demoUserInfo) {
          return JSON.parse(demoUserInfo);
        }
        return null;
      }
      
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

      if (isWeb) {
        // En entorno web, actualizamos la información del usuario demo
        console.log('Actualización de perfil en modo demostración (web)');
        
        // Simular un retraso para la demostración
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoUser = await AsyncStorage.getItem('@demo_user');
        const demoUserInfo = await AsyncStorage.getItem('@demo_user_info');
        
        if (demoUser && demoUserInfo) {
          const { name, email } = data;
          const mockUser = JSON.parse(demoUser);
          const userInfoData = JSON.parse(demoUserInfo);
          
          // Actualizar datos
          if (name) {
            mockUser.displayName = name;
            userInfoData.name = name;
          }
          
          if (email) {
            mockUser.email = email;
            userInfoData.email = email;
          }
          
          userInfoData.updatedAt = new Date().toISOString();
          
          // Guardar cambios
          await AsyncStorage.setItem('@demo_user', JSON.stringify(mockUser));
          await AsyncStorage.setItem('@demo_user_info', JSON.stringify(userInfoData));
          
          setCurrentUser(mockUser);
          setUserInfo(userInfoData);
          
          return userInfoData;
        }
        
        throw new Error('No hay usuario para actualizar');
      }

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

  // Efecto para observar cambios en la autenticación
  useEffect(() => {
    if (isWeb) {
      // En entorno web, verificamos si hay un usuario demo en localStorage
      const checkDemoUser = async () => {
        try {
          const demoUser = await AsyncStorage.getItem('@demo_user');
          const demoUserInfo = await AsyncStorage.getItem('@demo_user_info');
          
          if (demoUser && demoUserInfo) {
            setCurrentUser(JSON.parse(demoUser));
            setUserInfo(JSON.parse(demoUserInfo));
          }
        } catch (error) {
          console.error('Error al restaurar usuario demo:', error);
        } finally {
          setLoading(false);
        }
      };
      
      checkDemoUser();
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
    updateProfile: updateUserProfile,
    hasRole,
    isAdmin: () => hasRole('admin'),
    isTrabajador: () => hasRole('trabajador'),
    isVeterinario: () => hasRole('veterinario'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;