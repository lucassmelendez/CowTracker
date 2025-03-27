const { db, auth } = require('../config/firebase');

// Colección de usuarios en Firestore
const usersCollection = db.collection('users');

/**
 * Crear un nuevo usuario en Firebase Auth y Firestore
 * @param {Object} userData - Datos del usuario
 * @returns {Object} - Usuario creado
 */
const createUser = async (userData) => {
  try {
    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
      disabled: false
    });

    // Datos adicionales para guardar en Firestore
    const userDataForFirestore = {
      uid: userRecord.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user', // Rol por defecto: user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Guardar datos adicionales en Firestore
    await usersCollection.doc(userRecord.uid).set(userDataForFirestore);

    // Asignar rol personalizado en Firebase Auth
    await auth.setCustomUserClaims(userRecord.uid, { role: userData.role || 'user' });

    return { ...userRecord, ...userDataForFirestore };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

/**
 * Obtener usuario por ID
 * @param {string} uid - ID del usuario
 * @returns {Object} - Datos del usuario
 */
const getUserById = async (uid) => {
  try {
    // Obtener datos de Firestore
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

/**
 * Actualizar datos de usuario
 * @param {string} uid - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Object} - Usuario actualizado
 */
const updateUser = async (uid, userData) => {
  try {
    // Datos a actualizar en Firebase Auth
    const authUpdateData = {};
    if (userData.email) authUpdateData.email = userData.email;
    if (userData.password) authUpdateData.password = userData.password;
    if (userData.name) authUpdateData.displayName = userData.name;
    
    // Actualizar en Firebase Auth si hay datos
    if (Object.keys(authUpdateData).length > 0) {
      await auth.updateUser(uid, authUpdateData);
    }
    
    // Datos a actualizar en Firestore
    const firestoreUpdateData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    delete firestoreUpdateData.password; // No guardar contraseña en Firestore
    
    // Actualizar en Firestore
    await usersCollection.doc(uid).update(firestoreUpdateData);
    
    // Si se actualiza el rol, actualizar también en claims
    if (userData.role) {
      await auth.setCustomUserClaims(uid, { role: userData.role });
    }
    
    // Obtener usuario actualizado
    return await getUserById(uid);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

/**
 * Eliminar usuario
 * @param {string} uid - ID del usuario
 * @returns {boolean} - true si se eliminó correctamente
 */
const deleteUser = async (uid) => {
  try {
    // Eliminar de Firebase Auth
    await auth.deleteUser(uid);
    
    // Eliminar de Firestore
    await usersCollection.doc(uid).delete();
    
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

/**
 * Obtener todos los usuarios
 * @returns {Array} - Lista de usuarios
 */
const getAllUsers = async () => {
  try {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Cambiar rol de usuario
 * @param {string} uid - ID del usuario
 * @param {string} role - Nuevo rol
 * @returns {Object} - Usuario actualizado
 */
const changeUserRole = async (uid, role) => {
  try {
    // Actualizar rol en Firestore
    await usersCollection.doc(uid).update({ 
      role,
      updatedAt: new Date().toISOString()
    });
    
    // Actualizar claims en Firebase Auth
    await auth.setCustomUserClaims(uid, { role });
    
    // Obtener usuario actualizado
    return await getUserById(uid);
  } catch (error) {
    console.error('Error al cambiar rol de usuario:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  changeUserRole
};