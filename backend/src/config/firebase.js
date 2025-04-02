const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Función para obtener las credenciales de Firebase desde variables de entorno o archivo
const getFirebaseCredentials = () => {
  // Si estamos en producción, usamos las variables de entorno de Vercel
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_PRIVATE_KEY || 
        !process.env.FIREBASE_CLIENT_EMAIL) {
      console.error('❌ Variables de entorno de Firebase no configuradas');
      throw new Error('Variables de entorno de Firebase no configuradas');
    }
    
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };
  } else {
    // En desarrollo, usamos el archivo de credenciales
    try {
      return require('./firebase/serviceAccountKey.json');
    } catch (error) {
      console.error('❌ Error al cargar serviceAccountKey.json:', error);
      throw error;
    }
  }
};

if (!admin.apps.length) {
  const credentials = getFirebaseCredentials();
  
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://cowtracker-1f58a.firebaseio.com"
  });
  
  console.log('✅ Firebase Admin inicializado correctamente con las credenciales proporcionadas.');
  console.log(`🔥 Modo: ${process.env.NODE_ENV || 'development'}`);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };