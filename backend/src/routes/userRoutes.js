const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyToken,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUsersByRole,
  changeUserRole
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-token', verifyToken);

// Rutas protegidas
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Rutas de administrador
router.get('/', protect, admin, getUsers);
router.get('/role/:role', protect, getUsersByRole);
router.put('/:id/role', protect, admin, changeUserRole);

module.exports = router;