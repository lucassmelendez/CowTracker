import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Bandera para modo desarrollo - para ver todas las pantallas sin iniciar sesión
const DEV_MODE = false; // Desactivado ya que usaremos Firebase Auth real

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        // En modo desarrollo, establecer un token fake para poder ver todas las pantallas
        if (DEV_MODE) {
          setUserToken('dev-token');
          setUserData({
            _id: 'dev-user-id',
            name: 'Usuario Desarrollo',
            email: 'dev@example.com',
            role: 'admin',
          });
          setIsLoading(false);
          return;
        }
        
        if (user) {
          // Usuario autenticado
          const token = await user.getIdToken();
          
          // Obtener datos adicionales de Firestore, incluyendo el rol
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          
          const userData = {
            _id: user.uid,
            name: user.displayName || 'Usuario',
            email: user.email,
            role: userDoc.exists() ? (userDoc.data().role || 'user') : 'user', // Obtener rol de Firestore
          };
          
          // Guardar en AsyncStorage para acceso offline
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          
          setUserToken(token);
          setUserData(userData);
        } else {
          // No hay usuario autenticado
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          setUserToken(null);
          setUserData(null);
        }
      } catch (e) {
        console.log('Error al procesar estado de autenticación:', e);
      } finally {
        setIsLoading(false);
      }
    });

    // Limpiar el listener cuando se desmonte el componente
    return () => unsubscribe();
  }, []);

  const authContext = {
    login: async (email, password) => {
      // En modo desarrollo, simular login exitoso inmediatamente
      if (DEV_MODE) {
        setUserToken('dev-token');
        setUserData({
          _id: 'dev-user-id',
          name: 'Usuario Desarrollo',
          email: email || 'dev@example.com',
          role: 'admin',
        });
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        // Iniciar sesión con Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();
        
        // Obtener datos adicionales de Firestore, incluyendo el rol
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        
        // Obtener datos del usuario
        const userData = {
          _id: user.uid,
          name: user.displayName || 'Usuario',
          email: user.email,
          role: userDoc.exists() ? (userDoc.data().role || 'user') : 'user', // Obtener rol de Firestore
        };
        
        // Guardar en AsyncStorage para acceso offline
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setUserToken(token);
        setUserData(userData);
      } catch (e) {
        let errorMessage = 'Error al iniciar sesión';
        if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (e.code === 'auth/too-many-requests') {
          errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
        } else if (e.code === 'auth/network-request-failed') {
          errorMessage = 'Error de conexión. Verifique su conexión a internet';
        }
        setError(errorMessage);
        console.log('Error al iniciar sesión:', e);
      } finally {
        setIsLoading(false);
      }
    },
    register: async (name, email, password, role = 'user') => {
      // En modo desarrollo, simular registro exitoso inmediatamente
      if (DEV_MODE) {
        setUserToken('dev-token');
        setUserData({
          _id: 'dev-user-id',
          name: name || 'Usuario Desarrollo',
          email: email || 'dev@example.com',
          role: 'admin',
        });
        return;
      }
      
      // Validar que el rol sea válido
      const validRoles = ['admin', 'trabajador', 'veterinario', 'user'];
      if (!validRoles.includes(role)) {
        setError('Rol de usuario no válido');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        // Registrar usuario con Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Actualizar el perfil con el nombre
        await updateProfile(user, { displayName: name });
        
        // Guardar datos adicionales en Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
          name,
          email,
          role,
          createdAt: serverTimestamp(),
        });
        
        // Obtener token
        const token = await user.getIdToken();
        
        // Crear objeto de datos de usuario
        const userData = {
          _id: user.uid,
          name: name,
          email: user.email,
          role: role,
        };
        
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setUserToken(token);
        setUserData(userData);
      } catch (e) {
        let errorMessage = 'Error al registrar usuario';
        if (e.code === 'auth/email-already-in-use') {
          errorMessage = 'El email ya está en uso';
        } else if (e.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (e.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es demasiado débil';
        } else if (e.code === 'auth/network-request-failed') {
          errorMessage = 'Error de conexión. Verifique su conexión a internet';
        }
        setError(errorMessage);
        console.log('Error al registrar:', e);
      } finally {
        setIsLoading(false);
      }
    },
    logout: async () => {
      // En modo desarrollo, solo reiniciar el estado sin esperar
      if (DEV_MODE) {
        setUserToken('dev-token');
        setUserData({
          _id: 'dev-user-id',
          name: 'Usuario Desarrollo',
          email: 'dev@example.com',
          role: 'admin',
        });
        return;
      }
      
      setIsLoading(true);
      try {
        // Cerrar sesión en Firebase
        await signOut(auth);
        
        // Limpiar datos locales
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        
        setUserToken(null);
        setUserData(null);
      } catch (e) {
        console.log('Error al cerrar sesión:', e);
        setError('Error al cerrar sesión');
      } finally {
        setIsLoading(false);
      }
    },
    
    // Funciones para verificar roles
    isAdmin: () => {
      return userData?.role === 'admin';
    },
    
    isTrabajador: () => {
      return userData?.role === 'trabajador' || userData?.role === 'admin';
    },
    
    isVeterinario: () => {
      return userData?.role === 'veterinario' || userData?.role === 'admin';
    },
    
    // Datos del usuario y estado
    userData,
    userToken,
    isLoading,
    error,
        return;
      }
      
      setIsLoading(true);
      try {
        // Cerrar sesión en Firebase Auth
        await signOut(auth);
        
        // Limpiar datos locales
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