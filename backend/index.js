const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Sala = require('./models/Sala');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite leer los JSON que envíe Jordi

// Conexión a MongoDB (asumiendo que tu Docker ya está corriendo en el puerto 27017)
mongoose.connect('mongodb://localhost:27017/smartcampus')
  .then(() => console.log('Conexión exitosa a MongoDB Dockerizado'))
  .catch(err => console.error('Error conectando a Mongo:', err));

// ==========================================
// RUTAS / ENDPOINTS (CRUD)
// ==========================================

// 1. POST: El ESP32 de Jordi envía datos aquí
app.post('/api/update', async (req, res) => {
  const { idSala, piso, ocupada } = req.body;
  const pisosValidos = [-1, 2]; // Solo esos pisos existen en el edificio

  if (!pisosValidos.includes(piso)) {
    return res.status(400).json({ error: "Piso no válido. Solo se permiten salas en el piso -1 y 2." });
  }

  try {
    // 2. Verificar si la sala ya existe
    const salaExistente = await Sala.findOne({ idSala });

    // 3. Si es una sala NUEVA, verificar que no exceda el límite de 5 por piso
    if (!salaExistente) {
      const salasEnEsePiso = await Sala.countDocuments({ piso });
      if (salasEnEsePiso >= 5) {
        return res.status(400).json({ error: `El piso ${piso} ya tiene el máximo de 5 salas.` });
      }
    }

    // 4. Si pasó los filtros, guardamos o actualizamos
    const sala = await Sala.findOneAndUpdate(
      { idSala },
      { piso, ocupada, ultimaActualizacion: Date.now() },
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json(sala);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. GET: El Frontend (React) pide cuántas salas libres hay por piso
// En tu index.js, actualiza el GET /api/status así:
app.get('/api/status', async (req, res) => {
  try {
    const resumen = await Sala.aggregate([
      { $match: { ocupada: false } }, // 1. Filtra solo las desocupadas
      { 
        $group: { 
          _id: "$piso",                // 2. Agrúpalas por piso
          totalDisponibles: { $sum: 1 }, // 3. Cuenta cuántas hay en ese grupo
          ultimaActualizacion: { $max: "$ultimaActualizacion" } // 4. Busca la hora más reciente del piso
        } 
      },
      { $sort: { _id: 1 } } // Ordena por piso (Piso 1, luego Piso 2)
    ]);

    res.status(200).json(resumen);
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular disponibilidad' });
  }
});

// 3. GET: Dashboard de Administrador (Para la lógica de los 12 minutos)
app.get('/admin/status', async (req, res) => {
  try {
    // Trae absolutamente todas las salas para monitoreo crudo
    const todasLasSalas = await Sala.find({});
    res.status(200).json(todasLasSalas);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo datos de administración' });
  }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor SmartCampus corriendo en http://localhost:${PORT}`);
});