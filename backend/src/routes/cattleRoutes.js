const express = require('express');
const router = express.Router();
const {
  getCattle,
  getCattleById,
  createCattle,
  updateCattle,
  deleteCattle,
  addMedicalRecord,
} = require('../controllers/cattleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCattle)
  .post(protect, createCattle);

router.route('/:id')
  .get(protect, getCattleById)
  .put(protect, updateCattle)
  .delete(protect, deleteCattle);

router.route('/:id/medical')
  .post(protect, addMedicalRecord);

module.exports = router; 