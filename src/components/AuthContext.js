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
    let isInitialLoad = true;
    
    const loadSavedUser = async () => {
      try {
        const savedUserToken = await AsyncStorage.getItem('@user_token');
        const savedUserInfo = await AsyncStorage.getItem('@user_info');
        
        if (savedUserToken && savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo));
          api.setAuthToken(savedUserToken);
        }
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
      }
    };
    
    loadSavedUser();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const additionalInfo = await getUserInfo(user.uid);
        setCurrentUser(user);
        setUserInfo(additionalInfo);
        
        try {
          const token = await user.getIdToken();
          await AsyncStorage.setItem('@user_token', token);
          await AsyncStorage.setItem('@user_info', JSON.stringify(additionalInfo));
          
          api.setAuthToken(token);
        } catch (error) {
          console.error('Error al guardar datos de usuario:', error);
        }
      } else {
        setCurrentUser(null);
        setUserInfo(null);
        
        try {
          await AsyncStorage.removeItem('@user_token');
          await AsyncStorage.removeItem('@user_info');
          
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

  const register = async (name, email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);
      
      const normalizedEmail = email.toLowerCase();
      
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        email: normalizedEmail,
        role: role,
        createdAt: serverTimestamp(),
      });

      setCurrentUser(userCredential.user);
      setUserInfo({
        uid: userCredential.user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: serverTimestamp(),
      });

      router.push('/welcome');

      try {
        await api.post('/users/register', {
          name,
          email,
          password,
          role
        });
      } catch (backendError) {
        console.error('Error al registrar en el backend:', backendError);
      }

      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const normalizedEmail = email.toLowerCase();
      
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      const additionalInfo = await getUserInfo(userCredential.user.uid);
      setUserInfo(additionalInfo);
      setCurrentUser(userCredential.user);

      await AsyncStorage.setItem('@user_token', await userCredential.user.getIdToken());
      await AsyncStorage.setItem('@user_info', JSON.stringify(additionalInfo));

      return userCredential.user;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
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

  const hasRole = (role) => {
    if (!userInfo || !userInfo.role) return false;
    
    if (userInfo.role === 'admin') return true;
    
    return userInfo.role === role;
  };

  const updateUserProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const { name, email, password } = data;
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

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

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      await updateDoc(doc(firestore, 'users', user.uid), {
        ...updateData,
        updatedAt: serverTimestamp()
      });

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