const asyncHandler = require('express-async-handler');
const firebaseUserModel = require('../models/firebaseUserModel');
const { auth } = require('../config/firebase');

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/users/register
 * @access  Público
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validar datos de entrada
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Por favor ingrese todos los campos requeridos');
  }

  try {
    // Crear usuario en Firebase
    const userData = {
      name,
      email,
      password,
      role: role || 'user' // Rol por defecto: user
    };

    const user = await firebaseUserModel.createUser(userData);

    // Responder con datos del usuario (sin contraseña)
    const userResponse = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(201).json(userResponse);
  } catch (error) {
    // Manejar errores específicos de Firebase
    if (error.code === 'auth/email-already-exists') {
      res.status(400);
      throw new Error('El correo electrónico ya está registrado');
    } else {
      res.status(500);
      throw new Error('Error al registrar usuario: ' + error.message);
    }
  }
});

/**
 * @desc    Iniciar sesión de usuario
 * @route   POST /api/users/login
 * @access  Público
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validar datos de entrada
  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor ingrese correo y contraseña');
  }

  try {
    // Obtener token personalizado para el usuario
    // Nota: Este endpoint debe ser usado solo desde el backend
    // En la app móvil, se debe usar directamente Firebase Auth SDK
    
    // Este es un ejemplo de cómo se podría implementar,
    // pero en producción deberías usar Firebase Auth directamente desde el cliente
    const userRecord = await auth.getUserByEmail(email);
    
    // Obtener datos adicionales del usuario desde Firestore
    const userData = await firebaseUserModel.getUserById(userRecord.uid);
    
    // Crear token personalizado (solo para pruebas desde backend)
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

/**
 * @desc    Obtener perfil de usuario
 * @route   GET /api/users/profile
 * @access  Privado
 */
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    // El middleware protect ya añade el usuario al request
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

/**
 * @desc    Actualizar perfil de usuario
 * @route   PUT /api/users/profile
 * @access  Privado
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Datos a actualizar
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    // Actualizar usuario
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

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Privado/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await firebaseUserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener usuarios: ' + error.message);
  }
});

/**
 * @desc    Cambiar rol de usuario
 * @route   PUT /api/users/:id/role
 * @access  Privado/Admin
 */
const changeUserRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    
    if (!role) {
      res.status(400);
      throw new Error('Por favor especifique el rol');
    }
    
    // Validar que el rol sea válido
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