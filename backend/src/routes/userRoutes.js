const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  changeUserRole,
  refreshToken
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', protect, refreshToken);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.get('/', protect, admin, getUsers);
router.put('/:id/role', protect, admin, changeUserRole);

module.exports = router;