const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const { auth, db } = require('../config/firebase');
const firebaseUserModel = require('../models/firebaseUserModel');
const authService = require('../services/authService');

// @desc    Autenticar usuario y obtener token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Usar el servicio de autenticación
    const user = await authService.loginUser(email, password);
    res.json(user);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(401);
    throw new Error(error.message || 'Email o contraseña incorrectos');
  }
});

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    // Usar el servicio de autenticación
    const user = await authService.registerUser({ name, email, password, role });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(400);
    throw new Error(error.message || 'Error al registrar usuario');
  }
});

// @desc    Obtener perfil de usuario
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    // Obtener usuario de Firebase
    const user = await firebaseUserModel.getUserById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500);
    throw new Error('Error al obtener perfil de usuario');
  }
});

// @desc    Actualizar perfil de usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { name, role } = req.body;
    const userId = req.user._id;
    
    // Validar que el rol sea válido si se está actualizando
    if (role) {
      const validRoles = ['admin', 'trabajador', 'veterinario', 'user'];
      if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error('Rol de usuario no válido');
      }
    }
    
    // Actualizar usuario en Firebase
    if (name) {
      await auth.updateUser(userId, { displayName: name });
    }
    
    // Actualizar datos en Firestore
    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    
    await db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date(),
    });
    
    // Obtener usuario actualizado
    const updatedUser = await firebaseUserModel.getUserById(userId);
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(500);
    throw new Error('Error al actualizar perfil de usuario');
  }
});

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    // Obtener todos los usuarios de Firestore
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        _id: doc.id,
        ...doc.data(),
      });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500);
    throw new Error('Error al obtener usuarios');
  }
});

// @desc    Actualizar rol de usuario
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;
  
  try {
    // Usar el servicio de autenticación
    const updatedUser = await authService.changeUserRole(userId, role);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error);
    res.status(400);
    throw new Error(error.message || 'Error al actualizar rol de usuario');
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  updateUserRole,
};