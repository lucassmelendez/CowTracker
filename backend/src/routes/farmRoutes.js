const express = require('express');
const router = express.Router();
const {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmCattle,
  getFarmWorkers,
  getFarmVeterinarians,
  addWorkerToFarm,
  addVeterinarianToFarm,
  removeWorkerFromFarm,
  removeVeterinarianFromFarm
} = require('../controllers/farmController');
const { protect } = require('../middleware/authMiddleware');

// Rutas básicas de granjas
router.route('/')
  .get(protect, getFarms)
  .post(protect, createFarm);

router.route('/:id')
  .get(protect, getFarmById)
  .put(protect, updateFarm)
  .delete(protect, deleteFarm);

// Rutas para relaciones de granja
router.route('/:id/cattle')
  .get(protect, getFarmCattle);

router.route('/:id/workers')
  .get(protect, getFarmWorkers)
  .post(protect, addWorkerToFarm);

router.route('/:id/workers/:workerId')
  .delete(protect, removeWorkerFromFarm);

router.route('/:id/veterinarians')
  .get(protect, getFarmVeterinarians)
  .post(protect, addVeterinarianToFarm);

router.route('/:id/veterinarians/:vetId')
  .delete(protect, removeVeterinarianFromFarm);

module.exports = router; 