const asyncHandler = require('express-async-handler');
const { auth } = require('../config/firebase');
const firebaseUserModel = require('../models/firebaseUserModel');

// Middleware para verificar si el usuario está autenticado
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];
      
      // Verificar token con Firebase Auth
      const decodedToken = await auth.verifyIdToken(token);
      
      // Obtener usuario de Firebase con datos adicionales si es necesario
      const user = await firebaseUserModel.getUserById(decodedToken.uid);
      
      // Añadir información del usuario al request
      req.user = {
        ...decodedToken,
        ...user
      };
      
      next();
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(401);
      throw new Error('No autorizado, token inválido');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no se proporcionó token');
  }
});

// Función base para verificar roles
const checkRole = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('No autorizado, usuario no autenticado');
    }
    
    const userRole = req.user.role || 'user'; // Rol por defecto si no tiene uno asignado
    
    if (roles.includes(userRole)) {
      next();
    } else {
      res.status(403);
      throw new Error('Prohibido: no tienes permiso para acceder a este recurso');
    }
  });
};

// Middleware para roles específicos
const admin = checkRole(['admin']);
const trabajador = checkRole(['trabajador', 'admin']);
const veterinario = checkRole(['veterinario', 'admin']);

module.exports = { protect, admin, trabajador, veterinario, checkRole };