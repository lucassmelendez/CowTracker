const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin SDK
let serviceAccount;

try {
  // En producción, usar variables de entorno
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // En desarrollo, intentar cargar desde archivo local
    serviceAccount = require('../../../firebase-service-account.json');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log('Firebase Admin SDK inicializado correctamente');
  }
} catch (error) {
  console.error('Error al inicializar Firebase Admin SDK:', error);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };