import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWQ6KlEI48MlxmTxevy5wGV3Q_ALB-6p0",
  authDomain: "cowtracker-1f58a.firebaseapp.com",
  projectId: "cowtracker-1f58a",
  storageBucket: "cowtracker-1f58a.appspot.com",
  messagingSenderId: "788615932901",
  appId: "1:788615932901:android:06e8052893f898dc3a5d0c",
  databaseURL: "https://cowtracker-1f58a.firebaseio.com"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
// Inicializar Auth con persistencia para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const firestore = getFirestore(app);

console.log('Firebase inicializado correctamente con Web SDK');

// Exportar servicios de Firebase
export { auth, firestore };