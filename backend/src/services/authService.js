/**
 * Servicio para manejar operaciones de autenticación y roles
 */
const { auth, db } = require('../config/firebase');
const generateToken = require('../utils/generateToken');

const authService = {
  /**
   * Autenticar usuario con email y password
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} - Datos del usuario autenticado
   */
  loginUser: async (email, password) => {
    try {
      // Iniciar sesión con Firebase Auth
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Obtener datos adicionales de Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();
      
      // Determinar el rol del usuario
      let role = 'user';
      if (userDoc.exists) {
        role = userDoc.data().role || 'user';
      }
      
      return {
        _id: user.uid,
        name: user.displayName || 'Usuario',
        email: user.email,
        role: role,
        token: generateToken(user.uid),
      };
    } catch (error) {
      throw new Error('Email o contraseña incorrectos');
    }
  },
  
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} - Usuario registrado
   */
  registerUser: async (userData) => {
    const { name, email, password, role = 'user' } = userData;
    
    // Validar que el rol sea válido
    const validRoles = ['admin', 'trabajador', 'veterinario', 'user'];
    if (!validRoles.includes(role)) {
      throw new Error('Rol de usuario no válido');
    }
    
    try {
      // Verificar si el usuario ya existe
      const userExists = await auth.getUserByEmail(email).catch(() => null);
      if (userExists) {
        throw new Error('El usuario ya existe');
      }
      
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
        token: generateToken(userRecord.uid),
      };
    } catch (error) {
      throw new Error(error.message || 'Error al registrar usuario');
    }
  },
  
  /**
   * Cambiar el rol de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} newRole - Nuevo rol a asignar
   * @returns {Promise<Object>} - Usuario actualizado
   */
  changeUserRole: async (userId, newRole) => {
    // Validar que el rol sea válido
    const validRoles = ['admin', 'trabajador', 'veterinario', 'user'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Rol de usuario no válido');
    }
    
    try {
      // Actualizar rol en Firestore
      await db.collection('users').doc(userId).update({
        role: newRole,
        updatedAt: new Date(),
      });
      
      // Obtener usuario actualizado
      const userRecord = await auth.getUser(userId);
      const userDoc = await db.collection('users').doc(userId).get();
      
      return {
        _id: userId,
        name: userRecord.displayName || 'Usuario',
        email: userRecord.email,
        role: newRole,
      };
    } catch (error) {
      throw new Error('Error al cambiar el rol del usuario');
    }
  },
};

module.exports = authService;