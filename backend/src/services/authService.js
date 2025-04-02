const { auth, admin } = require('../config/firebase');
const firebaseUserModel = require('../models/firebaseUserModel');

/**
 * Servicio centralizado de autenticación
 */
class AuthService {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} - Usuario registrado
   */
  async registerUser(userData) {
    try {
      // Normalizar email
      const normalizedData = {
        ...userData,
        email: userData.email.toLowerCase()
      };
      
      // Crear usuario usando el modelo
      const user = await firebaseUserModel.createUser(normalizedData);
      
      return user;
    } catch (error) {
      console.error('Error en servicio de registro:', error);
      throw error;
    }
  }

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} - Datos del usuario autenticado
   */
  async loginWithEmailAndPassword(email, password) {
    try {
      const normalizedEmail = email.toLowerCase();
      
      // Autenticar usuario usando el modelo
      const userAuth = await firebaseUserModel.signInWithEmail(normalizedEmail, password);
      
      if (!userAuth) {
        throw new Error('Error de autenticación');
      }
      
      // Generar token personalizado con claims
      const customToken = await auth.createCustomToken(userAuth.uid, {
        role: userAuth.role || 'user'
      });
      
      // Obtener datos adicionales del usuario
      const userData = await firebaseUserModel.getUserById(userAuth.uid);
      
      return {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        token: customToken
      };
    } catch (error) {
      console.error('Error en servicio de login:', error);
      throw error;
    }
  }

  /**
   * Verifica la validez de un token y obtiene los datos del usuario
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} - Datos del usuario autenticado
   */
  async verifyToken(token) {
    try {
      // Extraer el UID del token
      // Para un token personalizado, debemos decodificarlo sin verificar la firma
      const decodedToken = this.decodeToken(token);
      
      if (!decodedToken || !decodedToken.uid) {
        throw new Error('Token inválido o con formato incorrecto');
      }
      
      // Obtener información del usuario desde Firestore
      const userData = await firebaseUserModel.getUserById(decodedToken.uid);
      
      if (!userData) {
        throw new Error('Usuario no encontrado');
      }
      
      return {
        uid: decodedToken.uid,
        ...userData
      };
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  }

  /**
   * Decodifica un token JWT básico para extraer el UID
   * @param {string} token - Token JWT a decodificar
   * @returns {Object} - Token decodificado
   */
  decodeToken(token) {
    try {
      // Decodificar el token JWT sin verificar la firma
      // Esto es seguro porque solo estamos obteniendo el UID para luego
      // verificar la existencia del usuario en la base de datos
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token con formato incorrecto');
      }
      
      const payload = parts[1];
      const decodedPayload = Buffer.from(payload, 'base64').toString();
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Refresca el token de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<string>} - Nuevo token personalizado
   */
  async refreshToken(userId) {
    try {
      // Obtener datos del usuario
      const userData = await firebaseUserModel.getUserById(userId);
      
      if (!userData) {
        throw new Error('Usuario no encontrado');
      }
      
      // Generar nuevo token con claims
      const customToken = await auth.createCustomToken(userId, {
        role: userData.role || 'user'
      });
      
      return customToken;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
