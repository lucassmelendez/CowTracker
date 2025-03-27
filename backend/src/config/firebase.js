const admin = require('firebase-admin');
const serviceAccount = require('../../../serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cowtracker-xxxxx.firebaseio.com" // Reemplaza con tu URL de Firebase
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };