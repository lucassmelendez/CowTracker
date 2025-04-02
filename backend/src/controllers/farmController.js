const asyncHandler = require('express-async-handler');
const { db } = require('../config/firebase');

const farmsCollection = db.collection('farms');
const farmWorkersCollection = db.collection('farm_workers');
const farmVeterinariansCollection = db.collection('farm_veterinarians');
const farmCattleCollection = db.collection('farm_cattle');
const cattleCollection = db.collection('cattle');

/**
 * @desc    Obtener todas las granjas del usuario
 * @route   GET /api/farms
 * @access  Privado
 */
const getFarms = asyncHandler(async (req, res) => {
  try {
    const farmsQuery = await farmsCollection
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const farms = farmsQuery.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    // Obtener el número de ganado para cada granja
    for (const farm of farms) {
      const cattleCount = await cattleCollection
        .where('farmId', '==', farm._id)
        .count()
        .get();
      
      farm.cattleCount = cattleCount.data().count;
    }

    res.json(farms);
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener granjas: ' + error.message);
  }
});

/**
 * @desc    Obtener una granja por ID
 * @route   GET /api/farms/:id
 * @access  Privado
 */
const getFarmById = asyncHandler(async (req, res) => {
  try {
    const farmDoc = await farmsCollection.doc(req.params.id).get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = {
      _id: farmDoc.id,
      ...farmDoc.data()
    };

    // Verificar propiedad
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de esta granja');
    }

    // Obtener el número de ganado
    const cattleCount = await cattleCollection
      .where('farmId', '==', farm._id)
      .count()
      .get();
    
    farm.cattleCount = cattleCount.data().count;

    res.json(farm);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Crear una nueva granja
 * @route   POST /api/farms
 * @access  Privado
 */
const createFarm = asyncHandler(async (req, res) => {
  try {
    const farmData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cattleCount: 0
    };

    // Validaciones
    if (!farmData.name) {
      res.status(400);
      throw new Error('El nombre de la granja es obligatorio');
    }

    if (!farmData.location) {
      res.status(400);
      throw new Error('La ubicación de la granja es obligatoria');
    }

    if (!farmData.size) {
      res.status(400);
      throw new Error('El tamaño de la granja es obligatorio');
    }

    const docRef = await farmsCollection.add(farmData);
    
    res.status(201).json({
      _id: docRef.id,
      ...farmData
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(400);
    }
    throw new Error('Error al crear granja: ' + error.message);
  }
});

/**
 * @desc    Actualizar una granja
 * @route   PUT /api/farms/:id
 * @access  Privado
 */
const updateFarm = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de esta granja');
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await farmRef.update(updateData);

    res.json({
      _id: req.params.id,
      ...farm,
      ...updateData
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Eliminar una granja
 * @route   DELETE /api/farms/:id
 * @access  Privado
 */
const deleteFarm = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de esta granja');
    }

    // Primero, actualizar todos los animales que pertenecen a esta granja
    const cattleQuery = await cattleCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    const batch = db.batch();
    
    cattleQuery.docs.forEach(doc => {
      const cattleRef = cattleCollection.doc(doc.id);
      batch.update(cattleRef, { farmId: null });
    });
    
    // Eliminar las relaciones de trabajadores
    const workersQuery = await farmWorkersCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    workersQuery.docs.forEach(doc => {
      const workerRef = farmWorkersCollection.doc(doc.id);
      batch.delete(workerRef);
    });
    
    // Eliminar las relaciones de veterinarios
    const vetsQuery = await farmVeterinariansCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    vetsQuery.docs.forEach(doc => {
      const vetRef = farmVeterinariansCollection.doc(doc.id);
      batch.delete(vetRef);
    });
    
    // Eliminar la granja
    batch.delete(farmRef);
    
    // Ejecutar todas las operaciones en batch
    await batch.commit();

    res.json({ message: 'Granja eliminada correctamente' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Añadir un trabajador a una granja
 * @route   POST /api/farms/:id/workers
 * @access  Privado
 */
const addWorkerToFarm = asyncHandler(async (req, res) => {
  try {
    const { workerId } = req.body;
    
    if (!workerId) {
      res.status(400);
      throw new Error('El ID del trabajador es obligatorio');
    }
    
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de esta granja');
    }
    
    // Verificar si ya existe la relación
    const existingRelation = await farmWorkersCollection
      .where('farmId', '==', req.params.id)
      .where('workerId', '==', workerId)
      .get();
    
    if (!existingRelation.empty) {
      res.status(400);
      throw new Error('Este trabajador ya está asignado a la granja');
    }
    
    // Crear la relación
    const relationData = {
      farmId: req.params.id,
      workerId,
      createdAt: new Date().toISOString()
    };
    
    await farmWorkersCollection.add(relationData);
    
    res.status(201).json({
      message: 'Trabajador añadido a la granja correctamente',
      ...relationData
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Eliminar un trabajador de una granja
 * @route   DELETE /api/farms/:id/workers/:workerId
 * @access  Privado
 */
const removeWorkerFromFarm = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de esta granja');
    }
    
    // Buscar la relación
    const relationQuery = await farmWorkersCollection
      .where('farmId', '==', req.params.id)
      .where('workerId', '==', req.params.workerId)
      .get();
    
    if (relationQuery.empty) {
      res.status(404);
      throw new Error('Este trabajador no está asignado a la granja');
    }
    
    // Eliminar la relación
    const batch = db.batch();
    relationQuery.docs.forEach(doc => {
      batch.delete(farmWorkersCollection.doc(doc.id));
    });
    
    await batch.commit();
    
    res.json({ message: 'Trabajador eliminado de la granja correctamente' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Obtener trabajadores de una granja
 * @route   GET /api/farms/:id/workers
 * @access  Privado
 */
const getFarmWorkers = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad o acceso
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado para ver esta información');
    }
    
    // Obtener las relaciones
    const workersRelations = await farmWorkersCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    const workerIds = workersRelations.docs.map(doc => doc.data().workerId);
    
    // Obtener los datos de los trabajadores
    const workers = [];
    
    for (const workerId of workerIds) {
      const userDoc = await db.collection('users').doc(workerId).get();
      if (userDoc.exists) {
        workers.push({
          _id: userDoc.id,
          ...userDoc.data()
        });
      }
    }
    
    res.json(workers);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Añadir un veterinario a una granja
 * @route   POST /api/farms/:id/veterinarians
 * @access  Privado
 */
const addVeterinarianToFarm = asyncHandler(async (req, res) => {
  try {
    const { veterinarianId } = req.body;
    
    if (!veterinarianId) {
      res.status(400);
      throw new Error('El ID del veterinario es obligatorio');
    }
    
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de esta granja');
    }
    
    // Verificar si ya existe la relación
    const existingRelation = await farmVeterinariansCollection
      .where('farmId', '==', req.params.id)
      .where('veterinarianId', '==', veterinarianId)
      .get();
    
    if (!existingRelation.empty) {
      res.status(400);
      throw new Error('Este veterinario ya está asignado a la granja');
    }
    
    // Crear la relación
    const relationData = {
      farmId: req.params.id,
      veterinarianId,
      createdAt: new Date().toISOString()
    };
    
    await farmVeterinariansCollection.add(relationData);
    
    res.status(201).json({
      message: 'Veterinario añadido a la granja correctamente',
      ...relationData
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Eliminar un veterinario de una granja
 * @route   DELETE /api/farms/:id/veterinarians/:veterinarianId
 * @access  Privado
 */
const removeVeterinarianFromFarm = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de esta granja');
    }
    
    // Buscar la relación
    const relationQuery = await farmVeterinariansCollection
      .where('farmId', '==', req.params.id)
      .where('veterinarianId', '==', req.params.veterinarianId)
      .get();
    
    if (relationQuery.empty) {
      res.status(404);
      throw new Error('Este veterinario no está asignado a la granja');
    }
    
    // Eliminar la relación
    const batch = db.batch();
    relationQuery.docs.forEach(doc => {
      batch.delete(farmVeterinariansCollection.doc(doc.id));
    });
    
    await batch.commit();
    
    res.json({ message: 'Veterinario eliminado de la granja correctamente' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Obtener veterinarios de una granja
 * @route   GET /api/farms/:id/veterinarians
 * @access  Privado
 */
const getFarmVeterinarians = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad o acceso
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado para ver esta información');
    }
    
    // Obtener las relaciones
    const vetsRelations = await farmVeterinariansCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    const vetIds = vetsRelations.docs.map(doc => doc.data().veterinarianId);
    
    // Obtener los datos de los veterinarios
    const veterinarians = [];
    
    for (const vetId of vetIds) {
      const userDoc = await db.collection('users').doc(vetId).get();
      if (userDoc.exists) {
        veterinarians.push({
          _id: userDoc.id,
          ...userDoc.data()
        });
      }
    }
    
    res.json(veterinarians);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Obtener ganado de una granja
 * @route   GET /api/farms/:id/cattle
 * @access  Privado
 */
const getFarmCattle = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmsCollection.doc(req.params.id);
    const farmDoc = await farmRef.get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = farmDoc.data();

    // Verificar propiedad o acceso
    if (farm.userId !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado para ver esta información');
    }
    
    // Obtener el ganado directamente
    const cattleQuery = await cattleCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    const cattle = cattleQuery.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    res.json(cattle);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  addWorkerToFarm,
  removeWorkerFromFarm,
  getFarmWorkers,
  addVeterinarianToFarm,
  removeVeterinarianFromFarm,
  getFarmVeterinarians,
  getFarmCattle
}; 