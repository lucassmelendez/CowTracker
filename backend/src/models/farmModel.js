const mongoose = require('mongoose');

const farmSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la granja es obligatorio'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
      },
      city: {
        type: String,
        required: [true, 'La ciudad es obligatoria'],
      },
      state: {
        type: String,
        required: [true, 'La provincia/estado es obligatorio'],
      },
      country: {
        type: String,
        required: [true, 'El país es obligatorio'],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    size: {
      value: {
        type: Number,
        required: [true, 'El tamaño es obligatorio'],
      },
      unit: {
        type: String,
        enum: ['hectáreas', 'acres'],
        default: 'hectáreas',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El propietario es obligatorio'],
    },
    areas: [
      {
        name: {
          type: String,
          required: true,
        },
        description: String,
        size: {
          value: Number,
          unit: {
            type: String,
            enum: ['hectáreas', 'acres'],
            default: 'hectáreas',
          },
        },
      },
    ],
    employees: [
      {
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
        contactInfo: {
          phone: String,
          email: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm; 