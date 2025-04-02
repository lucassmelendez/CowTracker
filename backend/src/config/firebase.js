const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cowtracker-1f58a.firebaseio.com"
  });
  
  console.log('✅ Firebase Admin inicializado correctamente con las credenciales proporcionadas.');
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };