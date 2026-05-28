const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Sala = require('./models/Sala');

// 1. Importamos las librerías de Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const TIEMPO_GRACIA_MS = 1000 * 10 * 1; // 10 segundos configurados actualmente

// Middlewares
app.use(cors());
app.use(express.json()); // Permite leer los JSON que envíe Jordi


// Ruta donde estará disponible el menú interactivo
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Conexión a MongoDB
//Creamos una variable para la URI de MongoDB, que puede ser configurada a través de una variable de entorno o usar un valor por defecto.
const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/smartcampus';
mongoose.connect(mongoURI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error conectando a Mongo:', err));

app.post('/api/update', async (req, res) => {
  const { idSala, piso, ocupada, hayMovimiento } = req.body;
  const pisosValidos = [-1, 2]; // Solo esos pisos existen en el edificio

  if (!pisosValidos.includes(piso)) {
    return res.status(400).json({ error: "Piso no válido. Solo se permiten salas en el piso -1 y 2." });
  }

  try {
    // 1. Buscamos si la sala ya existe globalmente por su nombre (idSala)
    const salaExistente = await Sala.findOne({ idSala });

    if (salaExistente) {
        // 2. Si la sala ya existe y el usuario intenta cambiarla de piso:
        if (salaExistente.piso !== piso) {
            // Verificamos si el piso de DESTINO tiene espacio
            const salasEnDestino = await Sala.countDocuments({ piso });
            if (salasEnDestino >= 5) {
                return res.status(400).json({ 
                    error: `No se puede mover la sala: el piso ${piso} ya alcanzó el máximo de 5 salas.` 
                });
            }
            // Si tiene espacio, actualizamos el piso
            salaExistente.piso = piso;
        }

        if (hayMovimiento) {
          salaExistente.ocupada = true; 
          console.log(`Se detectó movimiento en: ${idSala}`);
        } else {
          salaExistente.ocupada = ocupada;
        }

        salaExistente.hayMovimiento = hayMovimiento;
        salaExistente.ultimaActualizacion = Date.now();
        
        await salaExistente.save();

        // === INICIO LÓGICA TTL (SALA EXISTENTE) ===
        if (!hayMovimiento && ocupada) {
          setTimeout(async () => {
            const salaCheck = await Sala.findOne({ idSala });
            if (salaCheck && !salaCheck.hayMovimiento) {
              salaCheck.ocupada = false;
              salaCheck.ultimaActualizacion = Date.now();
              await salaCheck.save();
              console.log(`Liberada: ${idSala} por inactividad.`);
            }
          }, TIEMPO_GRACIA_MS);
        }
        // === FIN LÓGICA TTL ===
        return res.status(200).json(salaExistente);
    }

    // 4. Si la sala es NUEVA (no existía en ningún piso):
    const salasNuevasEnPiso = await Sala.countDocuments({ piso });
    if (salasNuevasEnPiso >= 5) {
        return res.status(400).json({ 
            error: `El piso ${piso} ya tiene el máximo de 5 salas.` 
        });
    }

    // 5. Creamos la sala desde cero con logica para saber si hay movimento, por defecto sera false.
    const nuevaSala = new Sala({ idSala, piso, ocupada, hayMovimiento: hayMovimiento || false });
    await nuevaSala.save();

    // === INICIO LÓGICA TTL (SALA NUEVA) ===
    if (!hayMovimiento && ocupada) {
      setTimeout(async () => {
        const salaCheck = await Sala.findOne({ idSala });
        if (salaCheck && !salaCheck.hayMovimiento) {
          salaCheck.ocupada = false;
          salaCheck.ultimaActualizacion = Date.now();
          await salaCheck.save();
        }
      }, TIEMPO_GRACIA_MS);
    }
    // === FIN LÓGICA TTL ===

    res.status(201).json(nuevaSala);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


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
      {
          $addFields: {
            totalMaximo: 5 // Esto agrega el campo 5 a cada piso sin usar operadores raros
        }
      },
      { $sort: { _id: 1 } } // Ordena por piso (Piso 1, luego Piso 2)
    ]);

    res.status(200).json(resumen);
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular disponibilidad' });
  }
});


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
  console.log(`Documentación de Swagger disponible en: http://localhost:${PORT}/docs`);
});