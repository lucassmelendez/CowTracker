const asyncHandler = require('express-async-handler');
const { db } = require('../config/firebase');
const authService = require('../services/authService');

const usersCollection = db.collection('users');

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/users/register
 * @access  Público
 */
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;
    
    // Validaciones
    if (!email || !password || !name) {
      res.status(400);
      throw new Error('Todos los campos son obligatorios');
    }

    const user = await authService.registerWithEmailAndPassword({
      email, 
      password, 
      name, 
      role
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Verificar credenciales y generar token
 * @route   POST /api/users/login
 * @access  Público
 */
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones
    if (!email || !password) {
      res.status(400);
      throw new Error('Email y contraseña son obligatorios');
    }
    
    const user = await authService.loginWithEmailAndPassword(email, password);
    
    res.json(user);
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

/**
 * @desc    Verificar token de autenticación
 * @route   POST /api/users/verify-token
 * @access  Público
 */
const verifyToken = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400);
      throw new Error('Token no proporcionado');
    }
    
    const user = await authService.verifyToken(token);
    
    res.json(user);
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

/**
 * @desc    Obtener perfil del usuario
 * @route   GET /api/users/profile
 * @access  Privado
 */
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
    
    const userData = userDoc.data();
    
    // No incluir el hash de la contraseña en la respuesta
    delete userData.passwordHash;
    
    res.json({
      uid: req.user.uid,
      ...userData
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener perfil de usuario: ' + error.message);
  }
});

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/users/profile
 * @access  Privado
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await authService.updateUserProfile(req.user.uid, req.body);
    
    // No incluir el hash de la contraseña en la respuesta
    delete updatedUser.passwordHash;
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Privado/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No tiene permisos para realizar esta acción');
    }
    
    const usersSnapshot = await usersCollection.get();
    
    const users = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      // No incluir el hash de la contraseña en la respuesta
      delete userData.passwordHash;
      return {
        uid: doc.id,
        ...userData
      };
    });
    
    res.json(users);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Obtener usuarios por rol
 * @route   GET /api/users/role/:role
 * @access  Privado
 */
const getUsersByRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.params;
    
    const usersQuery = await usersCollection
      .where('role', '==', role)
      .get();
    
    const users = usersQuery.docs.map(doc => {
      const userData = doc.data();
      // No incluir el hash de la contraseña en la respuesta
      delete userData.passwordHash;
      return {
        _id: doc.id,
        ...userData
      };
    });
    
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
    
    // Verificar si el usuario es administrador
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No tiene permisos para realizar esta acción');
    }
    
    if (!role) {
      res.status(400);
      throw new Error('El rol es obligatorio');
    }
    
    const userRef = usersCollection.doc(req.params.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar en Firestore
    await userRef.update({
      role,
      updatedAt: new Date().toISOString()
    });
    
    // Actualizar en Firebase Auth
    await auth.setCustomUserClaims(req.params.id, { role });
    
    const updatedUserDoc = await userRef.get();
    const userData = updatedUserDoc.data();
    
    // No incluir el hash de la contraseña en la respuesta
    delete userData.passwordHash;
    
    res.json({
      uid: req.params.id,
      ...userData
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUsersByRole,
  changeUserRole
};