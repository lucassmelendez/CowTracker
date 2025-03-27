import { Platform } from 'react-native';
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWQ6KlEI48MlxmTxevy5wGV3Q_ALB-6p0",
  authDomain: "cowtracker-1f58a.firebaseapp.com",
  projectId: "cowtracker-1f58a",
  storageBucket: "cowtracker-1f58a.firebasestorage.app",
  messagingSenderId: "788615932901",
  appId: "1:788615932901:android:06e8052893f898dc3a5d0c",
  databaseURL: "https://cowtracker-1f58a.firebaseio.com"
};

// Verificar si estamos en entorno web
const isWeb = Platform.OS === 'web';

// Inicializar Firebase de manera condicional según el entorno
let auth, firestore;

if (!isWeb) {
  // Entorno nativo (Android/iOS)
  let app;
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado correctamente en entorno nativo');
  } else {
    app = firebase.app();
    console.log('Firebase ya estaba inicializado en entorno nativo');
  }
  
  // Obtener servicios de Firebase
  auth = firebase.auth();
  firestore = firebase.firestore();
} else {
  // Entorno web - usar una implementación simulada
  console.log('Ejecutando en entorno web - usando implementación simulada de Firebase');
  
  // Implementación simulada de auth
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {}; // función de limpieza
    },
    signInWithEmailAndPassword: async () => {
      throw new Error('Firebase Auth no está disponible en entorno web');
    },
    createUserWithEmailAndPassword: async () => {
      throw new Error('Firebase Auth no está disponible en entorno web');
    },
    signOut: async () => {
      console.log('Simulando cierre de sesión');
    }
  };
  
  // Implementación simulada de firestore
  firestore = {
    collection: () => ({
      doc: () => ({
        set: async () => {},
        update: async () => {},
        get: async () => ({
          exists: false,
          data: () => null
        })
      }),
      get: async () => ({
        docs: []
      })
    })
  };
}

export { auth, firestore };