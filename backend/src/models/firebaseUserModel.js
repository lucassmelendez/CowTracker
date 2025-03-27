const { db, auth } = require('../config/firebase');

/**
 * Modelo para manejar usuarios en Firebase
 */
const firebaseUserModel = {
  /**
   * Obtener un usuario por su ID
   * @param {string} id - ID del usuario en Firebase
   * @returns {Promise<Object|null>} - Datos del usuario o null si no existe
   */
  getUserById: async (id) => {
    try {
      // Obtener usuario de Firebase Auth
      const userRecord = await auth.getUser(id);
      
      // Obtener datos adicionales de Firestore
      const userDoc = await db.collection('users').doc(id).get();
      
      if (!userDoc.exists) {
        // Si no existe en Firestore, devolver solo datos básicos
        return {
          _id: userRecord.uid,
          name: userRecord.displayName || 'Usuario',
          email: userRecord.email,
          role: 'user', // Rol por defecto
        };
      }
      
      // Combinar datos de Auth y Firestore
      return {
        _id: userRecord.uid,
        name: userRecord.displayName || userDoc.data().name || 'Usuario',
        email: userRecord.email,
        role: userDoc.data().role || 'user',
        ...userDoc.data(),
      };
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      return null;
    }
  },
  
  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object|null>} - Usuario creado o null si hay error
   */
  createUser: async (userData) => {
    try {
      const { email, password, name, role = 'user' } = userData;
      
      // Crear usuario en Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
      
      // Guardar datos adicionales en Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        role,
        createdAt: new Date(),
      });
      
      return {
        _id: userRecord.uid,
        name,
        email,
        role,
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return null;
    }
  },
  
  /**
   * Actualizar un usuario existente
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<boolean>} - true si se actualizó correctamente
   */
  updateUser: async (id, userData) => {
    try {
      const { name, role } = userData;
      
      // Actualizar en Firebase Auth si hay cambios en el nombre
      if (name) {
        await auth.updateUser(id, { displayName: name });
      }
      
      // Actualizar en Firestore
      await db.collection('users').doc(id).update({
        ...userData,
        updatedAt: new Date(),
      });
      
      return true;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return false;
    }
  },
  
  /**
   * Verificar si un usuario tiene un rol específico
   * @param {string} id - ID del usuario
   * @param {string} role - Rol a verificar
   * @returns {Promise<boolean>} - true si el usuario tiene el rol
   */
  hasRole: async (id, role) => {
    try {
      const userDoc = await db.collection('users').doc(id).get();
      
      if (!userDoc.exists) {
        return false;
      }
      
      return userDoc.data().role === role;
    } catch (error) {
      console.error('Error al verificar rol de usuario:', error);
      return false;
    }
  },
};

module.exports = firebaseUserModel;