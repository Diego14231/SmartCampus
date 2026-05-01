const mongoose = require('mongoose');
const salaSchema = new mongoose.Schema({
  piso: { 
    type: Number, 
    required: true,
    enum: [-1, 2] // Solo esos valores en los pisos
  },
  idSala: { 
    type: String, 
    required: true,
    unique: true // Evita que existan dos salas con el mismo nombre
  },
  ocupada: { 
    type: Boolean, 
    default: false 
  },
  ultimaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sala', salaSchema);