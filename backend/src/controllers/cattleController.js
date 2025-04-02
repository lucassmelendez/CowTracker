const asyncHandler = require('express-async-handler');
const Cattle = require('../models/cattleModel');

const getCattle = asyncHandler(async (req, res) => {
  const cattle = await Cattle.find({ owner: req.user._id })
    .populate('location.farm', 'name')
    .sort('-createdAt');

  res.json(cattle);
});

const getCattleById = asyncHandler(async (req, res) => {
  const cattle = await Cattle.findById(req.params.id)
    .populate('location.farm', 'name location')
    .populate('owner', 'name email');

  if (cattle) {
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

  const cattle = await Cattle.create({
    owner: req.user._id,
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
    weightHistory: [
      {
        date: new Date(),
        weight,
        notes: 'Peso inicial',
      },
    ],
  });

  if (cattle) {
    res.status(201).json(cattle);
  } else {
    res.status(400);
    throw new Error('Datos de ganado inválidos');
  }
});

const updateCattle = asyncHandler(async (req, res) => {
  const cattle = await Cattle.findById(req.params.id);

  if (cattle) {
    if (cattle.owner.toString() !== req.user._id.toString()) {
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

    // Actualizar el peso en el historial si cambió
    if (weight && weight !== cattle.weight) {
      cattle.weightHistory.push({
        date: new Date(),
        weight,
        notes: 'Actualización de peso',
      });
    }

    cattle.identificationNumber = identificationNumber || cattle.identificationNumber;
    cattle.type = type || cattle.type;
    cattle.breed = breed || cattle.breed;
    cattle.birthDate = birthDate || cattle.birthDate;
    cattle.gender = gender || cattle.gender;
    cattle.weight = weight || cattle.weight;
    cattle.purchaseDate = purchaseDate || cattle.purchaseDate;
    cattle.purchasePrice = purchasePrice || cattle.purchasePrice;
    cattle.status = status || cattle.status;
    cattle.healthStatus = healthStatus || cattle.healthStatus;
    cattle.notes = notes || cattle.notes;
    cattle.location = location || cattle.location;

    const updatedCattle = await cattle.save();
    res.json(updatedCattle);
  } else {
    res.status(404);
    throw new Error('Ganado no encontrado');
  }
});

const deleteCattle = asyncHandler(async (req, res) => {
  const cattle = await Cattle.findById(req.params.id);

  if (cattle) {
    if (cattle.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    await cattle.remove();
    res.json({ message: 'Ganado eliminado' });
  } else {
    res.status(404);
    throw new Error('Ganado no encontrado');
  }
});

const addMedicalRecord = asyncHandler(async (req, res) => {
  const { date, treatment, diagnosis, medication, veterinarian, notes } = req.body;

  const cattle = await Cattle.findById(req.params.id);

  if (cattle) {
    if (cattle.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    const medicalRecord = {
      date: date || new Date(),
      treatment,
      diagnosis,
      medication,
      veterinarian,
      notes,
    };

    cattle.medicalHistory.push(medicalRecord);
    await cattle.save();
    res.status(201).json(cattle);
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