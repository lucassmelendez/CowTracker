const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { auth } = require('../config/firebase');
const firebaseUserModel = require('../models/firebaseUserModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cowtracker-secret-key');
      
      const userRecord = await auth.getUser(decoded.uid);
      
      req.user = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: decoded.role || userRecord.customClaims?.role || 'user'
      };
      
      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      res.status(401);
      throw new Error('No autorizado, token inválido');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no se proporcionó un token');
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