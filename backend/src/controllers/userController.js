const asyncHandler = require('express-async-handler');
const firebaseUserModel = require('../models/firebaseUserModel');
const { auth } = require('../config/firebase');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Por favor ingrese todos los campos requeridos');
  }

  try {
    const userData = {
      name,
      email,
      password,
      role: role || 'user'
    };

    const user = await firebaseUserModel.createUser(userData);

    const userResponse = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      res.status(400);
      throw new Error('El correo electrónico ya está registrado');
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
    const userRecord = await auth.getUserByEmail(email);
    
    const userData = await firebaseUserModel.getUserById(userRecord.uid);
    
    const customToken = await auth.createCustomToken(userRecord.uid, {
      role: userData.role || 'user'
    });
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      name: userData.name,
      role: userData.role,
      token: customToken
    });
  } catch (error) {
    res.status(401);
    throw new Error('Credenciales inválidas');
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
        role: user.role
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
    const { name, email, password } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    const updatedUser = await firebaseUserModel.updateUser(req.user.uid, updateData);
    
    res.json({
      uid: updatedUser.uid,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  changeUserRole
};