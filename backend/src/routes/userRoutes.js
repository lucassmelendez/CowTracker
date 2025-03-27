const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  changeUserRole
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas protegidas (requieren autenticación)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Rutas de administrador
router.get('/', protect, admin, getUsers);
router.put('/:id/role', protect, admin, changeUserRole);

module.exports = router;