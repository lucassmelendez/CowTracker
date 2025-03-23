const mongoose = require('mongoose');

const saleSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'La fecha de venta es obligatoria'],
      default: Date.now,
    },
    cattle: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cattle',
      required: [true, 'El ganado es obligatorio'],
    }],
    buyer: {
      name: {
        type: String,
        required: [true, 'El nombre del comprador es obligatorio'],
      },
      contactInfo: {
        phone: String,
        email: String,
        address: String,
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'El monto total es obligatorio'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'El método de pago es obligatorio'],
      enum: ['efectivo', 'transferencia', 'cheque', 'otro'],
    },
    paymentStatus: {
      type: String,
      required: [true, 'El estado del pago es obligatorio'],
      enum: ['pendiente', 'parcial', 'completado'],
      default: 'pendiente',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El vendedor es obligatorio'],
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'La granja es obligatoria'],
    },
    notes: {
      type: String,
    },
    invoice: {
      number: {
        type: String,
      },
      issuedDate: {
        type: Date,
      },
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale; 