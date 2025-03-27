const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  updateUserRole,
} = require('../controllers/userController');
const { protect, admin, trabajador, veterinario } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.route('/')
  .post(registerUser)
  .get(protect, admin, getUsers); // Solo admin puede ver todos los usuarios

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
  
// Ruta para cambiar el rol de un usuario (solo admin)
router.route('/:id/role').put(protect, admin, updateUserRole);

// Rutas específicas para cada rol
router.route('/admin').get(protect, admin, (req, res) => {
  res.json({ message: 'Ruta de administrador', user: req.user });
});

router.route('/trabajador').get(protect, trabajador, (req, res) => {
  res.json({ message: 'Ruta de trabajador', user: req.user });
});

router.route('/veterinario').get(protect, veterinario, (req, res) => {
  res.json({ message: 'Ruta de veterinario', user: req.user });
});

module.exports = router;