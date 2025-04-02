const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const firebaseUserModel = require('../models/firebaseUserModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const user = await authService.verifyToken(token);
      
      req.user = user;
      
      next();
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(401);
      throw new Error('No autorizado, token inválido');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no hay token');
  }
});

const checkRole = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('No autorizado, usuario no autenticado');
    }
    
    const userRole = req.user.role || 'user';
    
    if (roles.includes(userRole)) {
      next();
    } else {
      res.status(403);
      throw new Error('Prohibido: no tienes permiso para acceder a este recurso');
    }
  });
};

const admin = checkRole(['admin']);
const trabajador = checkRole(['trabajador', 'admin']);
const veterinario = checkRole(['veterinario', 'admin']);

module.exports = { protect, admin, trabajador, veterinario, checkRole };