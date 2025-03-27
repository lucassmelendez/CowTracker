const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Inicializar Firebase Admin con las credenciales del archivo serviceAccountKey.json
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cowtracker-1f58a.firebaseio.com" // URL de tu proyecto Firebase
  });
  
  console.log('✅ Firebase Admin inicializado correctamente con las credenciales proporcionadas.');
}

// Exportar servicios de Firebase Admin
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };