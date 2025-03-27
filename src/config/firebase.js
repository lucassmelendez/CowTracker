import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// La configuración se carga automáticamente desde los archivos nativos
// google-services.json (Android) y GoogleService-Info.plist (iOS)

// Verificar si Firebase ya está inicializado
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp({});
} else {
  app = firebase.app();
}

// Obtener servicios de Firebase
const auth = firebase.auth();
const firestore = firebase.firestore();

export { auth, firestore };