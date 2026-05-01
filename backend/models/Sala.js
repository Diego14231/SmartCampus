const salaSchema = {
  piso: Number,
  idSala: String, // Ejemplo: "Sala_1"
  ocupada: Boolean,
  ultimaActualizacion: { type: Date, default: Date.now }
};