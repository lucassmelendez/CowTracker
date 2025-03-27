const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { auth } = require('../config/firebase');
const firebaseUserModel = require('../models/firebaseUserModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario de Firebase
      const user = await firebaseUserModel.getUserById(decoded.id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Añadir usuario a la solicitud
      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token inválido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no se proporcionó token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('No autorizado como administrador');
  }
};

const trabajador = (req, res, next) => {
  if (req.user && (req.user.role === 'trabajador' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('No autorizado como trabajador');
  }
};

const veterinario = (req, res, next) => {
  if (req.user && (req.user.role === 'veterinario' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('No autorizado como veterinario');
  }
};

module.exports = { protect, admin, trabajador, veterinario };