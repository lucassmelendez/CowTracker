const asyncHandler = require('express-async-handler');
const Cattle = require('../models/cattleModel');

const getCattle = asyncHandler(async (req, res) => {
  const cattle = await Cattle.getAllCattle(req.user.uid);
  res.json(cattle);
});

const getCattleById = asyncHandler(async (req, res) => {
  const cattle = await Cattle.getCattleById(req.params.id);

  if (cattle) {
    // Verificar que el usuario sea propietario
    if (cattle.owner !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }
    res.json(cattle);
  } else {
    res.status(404);
    throw new Error('Ganado no encontrado');
  }
});

const createCattle = asyncHandler(async (req, res) => {
  const {
    identificationNumber,
    type,
    breed,
    birthDate,
    gender,
    weight,
    purchaseDate,
    purchasePrice,
    status,
    healthStatus,
    notes,
    location,
  } = req.body;

  const cattle = await Cattle.createCattle({
    owner: req.user.uid,
    identificationNumber,
    type,
    breed,
    birthDate,
    gender,
    weight,
    purchaseDate,
    purchasePrice,
    status,
    healthStatus,
    notes,
    location,
  });

  if (cattle) {
    res.status(201).json(cattle);
  } else {
    res.status(400);
    throw new Error('Datos de ganado inválidos');
  }
});

const updateCattle = asyncHandler(async (req, res) => {
  const cattle = await Cattle.getCattleById(req.params.id);

  if (cattle) {
    if (cattle.owner !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    const {
      identificationNumber,
      type,
      breed,
      birthDate,
      gender,
      weight,
      purchaseDate,
      purchasePrice,
      status,
      healthStatus,
      notes,
      location,
    } = req.body;

    const updatedCattle = await Cattle.updateCattle(req.params.id, {
      identificationNumber: identificationNumber || cattle.identificationNumber,
      type: type || cattle.type,
      breed: breed || cattle.breed,
      birthDate: birthDate || cattle.birthDate,
      gender: gender || cattle.gender,
      weight: weight || cattle.weight,
      purchaseDate: purchaseDate || cattle.purchaseDate,
      purchasePrice: purchasePrice || cattle.purchasePrice,
      status: status || cattle.status,
      healthStatus: healthStatus || cattle.healthStatus,
      notes: notes || cattle.notes,
      location: location || cattle.location,
    });

    res.json(updatedCattle);
  } else {
    res.status(404);
    throw new Error('Ganado no encontrado');
  }
});

const deleteCattle = asyncHandler(async (req, res) => {
  const cattle = await Cattle.getCattleById(req.params.id);

  if (cattle) {
    if (cattle.owner !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    await Cattle.deleteCattle(req.params.id);
    res.json({ message: 'Ganado eliminado' });
  } else {
    res.status(404);
    throw new Error('Ganado no encontrado');
  }
});

const addMedicalRecord = asyncHandler(async (req, res) => {
  const { date, treatment, diagnosis, medication, veterinarian, notes } = req.body;

  const cattle = await Cattle.getCattleById(req.params.id);

  if (cattle) {
    if (cattle.owner !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    const medicalRecord = {
      date: date || new Date().toISOString(),
      treatment,
      diagnosis,
      medication,
      veterinarian,
      notes,
    };

    const updatedCattle = await Cattle.addMedicalRecord(req.params.id, medicalRecord);
    res.status(201).json(updatedCattle);
  } else {
    res.status(404);
    throw new Error('Ganado no encontrado');
  }
});

module.exports = {
  getCattle,
  getCattleById,
  createCattle,
  updateCattle,
  deleteCattle,
  addMedicalRecord,
}; 