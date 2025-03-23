const mongoose = require('mongoose');

const cattleSchema = mongoose.Schema(
  {
    identificationNumber: {
      type: String,
      required: [true, 'El número de identificación es obligatorio'],
      unique: true,
    },
    type: {
      type: String,
      required: [true, 'El tipo de ganado es obligatorio'],
      enum: ['bovino', 'ovino', 'caprino', 'porcino', 'otro'],
    },
    breed: {
      type: String,
      required: [true, 'La raza es obligatoria'],
    },
    birthDate: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    gender: {
      type: String,
      required: [true, 'El género es obligatorio'],
      enum: ['macho', 'hembra'],
    },
    weight: {
      type: Number,
      required: [true, 'El peso es obligatorio'],
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
    },
    status: {
      type: String,
      required: [true, 'El estado es obligatorio'],
      enum: ['activo', 'vendido', 'fallecido'],
      default: 'activo',
    },
    healthStatus: {
      type: String,
      enum: ['saludable', 'enfermo', 'en tratamiento', 'en cuarentena'],
      default: 'saludable',
    },
    notes: {
      type: String,
    },
    location: {
      farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: [true, 'La granja es obligatoria'],
      },
      area: {
        type: String,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El propietario es obligatorio'],
    },
    medicalHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        treatment: {
          type: String,
          required: true,
        },
        diagnosis: {
          type: String,
        },
        medication: {
          type: String,
        },
        veterinarian: {
          type: String,
        },
        notes: {
          type: String,
        },
      },
    ],
    weightHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        weight: {
          type: Number,
          required: true,
        },
        notes: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cattle = mongoose.model('Cattle', cattleSchema);

module.exports = Cattle; 