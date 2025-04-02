const express = require('express');
const router = express.Router();
const {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  addWorkerToFarm,
  removeWorkerFromFarm,
  getFarmWorkers,
  addVeterinarianToFarm,
  removeVeterinarianFromFarm,
  getFarmVeterinarians,
  getFarmCattle
} = require('../controllers/farmController');
const { protect } = require('../middleware/authMiddleware');

// Rutas principales de granjas
router.route('/')
  .get(protect, getFarms)
  .post(protect, createFarm);

router.route('/:id')
  .get(protect, getFarmById)
  .put(protect, updateFarm)
  .delete(protect, deleteFarm);

// Rutas para trabajadores
router.route('/:id/workers')
  .get(protect, getFarmWorkers)
  .post(protect, addWorkerToFarm);

router.route('/:id/workers/:workerId')
  .delete(protect, removeWorkerFromFarm);

// Rutas para veterinarios
router.route('/:id/veterinarians')
  .get(protect, getFarmVeterinarians)
  .post(protect, addVeterinarianToFarm);

router.route('/:id/veterinarians/:veterinarianId')
  .delete(protect, removeVeterinarianFromFarm);

// Rutas para ganado de la granja
router.route('/:id/cattle')
  .get(protect, getFarmCattle);

module.exports = router; 