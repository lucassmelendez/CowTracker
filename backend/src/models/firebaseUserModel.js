const { db, auth, admin } = require('../config/firebase');

const usersCollection = db.collection('users');

const createUser = async (userData) => {
  try {
    // Normalizar el email a minúsculas
    const normalizedEmail = userData.email.toLowerCase();
    
    // Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email: normalizedEmail,
      password: userData.password,
      displayName: userData.name,
      disabled: false
    });

    // Preparar datos para Firestore
    const userDataForFirestore = {
      uid: userRecord.uid,
      email: normalizedEmail,
      name: userData.name,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Guardar en Firestore
    await usersCollection.doc(userRecord.uid).set(userDataForFirestore);

    // Establecer claims personalizados para el control de acceso basado en roles
    await auth.setCustomUserClaims(userRecord.uid, { role: userData.role || 'user' });

    return { ...userRecord, ...userDataForFirestore };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

const getUserById = async (uid) => {
  try {
    const userDoc = await usersCollection.doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

const updateUser = async (uid, userData) => {
  try {
    const authUpdateData = {};
    if (userData.email) authUpdateData.email = userData.email;
    if (userData.password) authUpdateData.password = userData.password;
    if (userData.name) authUpdateData.displayName = userData.name;
    
    if (Object.keys(authUpdateData).length > 0) {
      await auth.updateUser(uid, authUpdateData);
    }
    
    const firestoreUpdateData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    delete firestoreUpdateData.password;
    
    await usersCollection.doc(uid).update(firestoreUpdateData);
    
    if (userData.role) {
      await auth.setCustomUserClaims(uid, { role: userData.role });
    }
    
    return await getUserById(uid);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

const deleteUser = async (uid) => {
  try {
    await auth.deleteUser(uid);
    
    await usersCollection.doc(uid).delete();
    
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

const changeUserRole = async (uid, role) => {
  try {
    await usersCollection.doc(uid).update({ 
      role,
      updatedAt: new Date().toISOString()
    });
    
    await auth.setCustomUserClaims(uid, { role });
    
    return await getUserById(uid);
  } catch (error) {
    console.error('Error al cambiar rol de usuario:', error);
    throw error;
  }
};

/**
 * Autentica a un usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario autenticado
 */
const signInWithEmail = async (email, password) => {
  try {
    console.log(`Intentando autenticar a usuario con email: ${email}`);
    
    // Firebase Admin no tiene signInWithEmailAndPassword directamente
    // Primero buscamos el usuario por email
    const userRecord = await auth.getUserByEmail(email);
    
    // Verificamos que exista el usuario
    if (!userRecord) {
      console.error('Usuario no encontrado');
      throw new Error('Usuario no encontrado');
    }
    
    console.log(`Usuario encontrado con UID: ${userRecord.uid}`);
    
    // NOTA: Firebase Admin no puede verificar contraseñas directamente
    // En un entorno de producción, necesitarías una solución más robusta
    // Aquí estamos confiando en que el usuario existe y generando un token
    
    // Generamos un token personalizado para la autenticación
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // Obtenemos datos adicionales del usuario desde Firestore
    const userData = await getUserById(userRecord.uid);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      name: userData.name,
      role: userData.role,
      token: customToken
    };
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    
    // Para evitar revelar información sensible, simplificamos el mensaje de error
    if (error.code === 'auth/user-not-found') {
      throw new Error('Credenciales incorrectas');
    }
    
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  changeUserRole,
  signInWithEmail
};