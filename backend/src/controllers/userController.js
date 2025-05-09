const asyncHandler = require('express-async-handler');
const firebaseUserModel = require('../models/firebaseUserModel');
const authService = require('../services/authService');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Por favor ingrese todos los campos requeridos');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Por favor ingrese un correo electrónico válido');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  try {
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      // Los campos adicionales se generarán automáticamente a partir del nombre
    };

    const user = await authService.registerUser(userData);

    const userResponse = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
      primer_nombre: user.primer_nombre || '',
      segundo_nombre: user.segundo_nombre || '',
      primer_apellido: user.primer_apellido || '',
      segundo_apellido: user.segundo_apellido || '',
      id_usuario: user.uid
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    
    if (error.code === 'auth/email-already-exists') {
      res.status(400);
      throw new Error('El correo electrónico ya está registrado');
    } else if (error.code === 'auth/invalid-email') {
      res.status(400);
      throw new Error('El formato del correo electrónico es inválido');
    } else if (error.code === 'auth/weak-password') {
      res.status(400);
      throw new Error('La contraseña es demasiado débil');
    } else {
      res.status(500);
      throw new Error('Error al registrar usuario: ' + error.message);
    }
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor ingrese correo y contraseña');
  }

  try {
    const authResult = await authService.loginWithEmailAndPassword(email, password);
    
    res.json(authResult);
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      res.status(401);
      throw new Error('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
    } else if (error.code === 'auth/invalid-email') {
      res.status(400);
      throw new Error('El formato del email es inválido.');
    } else if (error.code === 'auth/user-disabled') {
      res.status(403);
      throw new Error('Esta cuenta ha sido deshabilitada.');
    } else if (error.code === 'auth/too-many-requests') {
      res.status(429);
      throw new Error('Demasiados intentos fallidos. Inténtalo más tarde.');
    } else {
      res.status(500);
      throw new Error('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await firebaseUserModel.getUserById(req.user.uid);
    
    if (user) {
      res.json({
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        primer_nombre: user.primer_nombre || '',
        segundo_nombre: user.segundo_nombre || '',
        primer_apellido: user.primer_apellido || '',
        segundo_apellido: user.segundo_apellido || '',
        id_usuario: user.uid
      });
    } else {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener perfil de usuario: ' + error.message);
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (phone !== undefined) updateData.phone = phone;
    
    const updatedUser = await firebaseUserModel.updateUser(req.user.uid, updateData);
    
    res.json({
      uid: updatedUser.uid,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || '',
      primer_nombre: updatedUser.primer_nombre || '',
      segundo_nombre: updatedUser.segundo_nombre || '',
      primer_apellido: updatedUser.primer_apellido || '',
      segundo_apellido: updatedUser.segundo_apellido || '',
      id_usuario: updatedUser.uid
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error al actualizar perfil: ' + error.message);
  }
});

const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await firebaseUserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener usuarios: ' + error.message);
  }
});

const changeUserRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    
    if (!role) {
      res.status(400);
      throw new Error('Por favor especifique el rol');
    }
    
    const validRoles = ['user', 'admin', 'trabajador', 'veterinario'];
    if (!validRoles.includes(role)) {
      res.status(400);
      throw new Error('Rol inválido');
    }
    
    const updatedUser = await firebaseUserModel.changeUserRole(userId, role);
    
    res.json({
      uid: updatedUser.uid,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error al cambiar rol de usuario: ' + error.message);
  }
});

/**
 * @desc    Refrescar token de autenticación
 * @route   POST /api/users/refresh-token
 * @access  Private
 */
const refreshToken = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const newToken = await authService.refreshToken(userId);
    
    res.json({
      token: newToken
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(500);
    throw new Error('Error al refrescar token de autenticación');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  changeUserRole,
  refreshToken
};