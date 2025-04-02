const asyncHandler = require('express-async-handler');
const { db } = require('../config/firebase');

const farmCollection = db.collection('farms');
const cattleCollection = db.collection('cattle');
const farmWorkersCollection = db.collection('farm_workers');
const farmVeterinariansCollection = db.collection('farm_veterinarians');
const usersCollection = db.collection('users');

/**
 * @desc    Obtener todas las granjas del usuario
 * @route   GET /api/farms
 * @access  Private
 */
const getFarms = asyncHandler(async (req, res) => {
  try {
    console.log('Buscando granjas para usuario:', req.user.uid);
    
    let farms = [];
    
    // Modifica la consulta para evitar el error de índice compuesto
    // Primero obtenemos las granjas por userId sin ordenar
    const farmsQuery = await farmCollection
      .where('userId', '==', req.user.uid)
      .get();
    
    if (!farmsQuery.empty) {
      // Obtener los datos y ordenarlos en memoria
      farms = farmsQuery.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar los resultados en memoria
      farms.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // orden descendente
      });
    }

    res.json(farms);
  } catch (error) {
    console.error('Error al obtener granjas:', error);
    res.status(500);
    throw new Error('Error al obtener granjas: ' + error.message);
  }
});

/**
 * @desc    Obtener una granja por ID
 * @route   GET /api/farms/:id
 * @access  Private
 */
const getFarmById = asyncHandler(async (req, res) => {
  try {
    const farmDoc = await farmCollection.doc(req.params.id).get();

    if (!farmDoc.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }

    const farm = {
      _id: farmDoc.id,
      ...farmDoc.data()
    };

    // Verificar propiedad o permisos
    if (farm.userId !== req.user.uid) {
      // Verificar si el usuario es trabajador o veterinario de la granja
      const isWorker = await checkUserFarmRelation(req.user.uid, req.params.id, 'worker');
      const isVet = await checkUserFarmRelation(req.user.uid, req.params.id, 'vet');
      
      if (!isWorker && !isVet && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('No autorizado para acceder a esta granja');
      }
    }

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
 * @access  Private
 */
const createFarm = asyncHandler(async (req, res) => {
  try {
    const farmData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await farmCollection.add(farmData);
    
    res.status(201).json({
      _id: docRef.id,
      ...farmData
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error al crear granja: ' + error.message);
  }
});

/**
 * @desc    Actualizar una granja existente
 * @route   PUT /api/farms/:id
 * @access  Private
 */
const updateFarm = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmCollection.doc(req.params.id);
    const farm = await farmRef.get();
    
    if (!farm.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }
    
    const farmData = farm.data();
    
    // Verificar propiedad
    if (farmData.userId !== req.user.uid && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado para actualizar esta granja');
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // No permitir cambiar el propietario
    delete updateData.userId;
    
    await farmRef.update(updateData);
    
    res.json({
      _id: req.params.id,
      ...farmData,
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
 * @access  Private
 */
const deleteFarm = asyncHandler(async (req, res) => {
  try {
    const farmRef = farmCollection.doc(req.params.id);
    const farm = await farmRef.get();
    
    if (!farm.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }
    
    // Verificar propiedad
    if (farm.data().userId !== req.user.uid && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado para eliminar esta granja');
    }
    
    // También eliminar relaciones (trabajadores, veterinarios, etc.)
    // Eliminar trabajadores asociados
    const workersQuery = await farmWorkersCollection.where('farmId', '==', req.params.id).get();
    const workersDeletePromises = workersQuery.docs.map(doc => doc.ref.delete());
    
    // Eliminar veterinarios asociados
    const vetsQuery = await farmVeterinariansCollection.where('farmId', '==', req.params.id).get();
    const vetsDeletePromises = vetsQuery.docs.map(doc => doc.ref.delete());
    
    // Actualizar ganado asociado (cambiar farmId a null)
    const cattleQuery = await cattleCollection.where('farmId', '==', req.params.id).get();
    const cattleUpdatePromises = cattleQuery.docs.map(doc => 
      doc.ref.update({ farmId: null, updatedAt: new Date().toISOString() })
    );
    
    // Ejecutar todas las operaciones
    await Promise.all([
      ...workersDeletePromises,
      ...vetsDeletePromises,
      ...cattleUpdatePromises,
      farmRef.delete()
    ]);
    
    res.json({ message: 'Granja eliminada correctamente' });
  } catch (error) {
    res.status(500);
    throw new Error('Error al eliminar granja: ' + error.message);
  }
});

/**
 * @desc    Obtener todo el ganado de una granja
 * @route   GET /api/farms/:id/cattle
 * @access  Private
 */
const getFarmCattle = asyncHandler(async (req, res) => {
  try {
    // Verificar acceso a la granja
    await checkFarmAccess(req.params.id, req.user.uid);
    
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

/**
 * @desc    Obtener trabajadores de una granja
 * @route   GET /api/farms/:id/workers
 * @access  Private
 */
const getFarmWorkers = asyncHandler(async (req, res) => {
  try {
    // Verificar acceso a la granja
    await checkFarmAccess(req.params.id, req.user.uid);
    
    const workersQuery = await farmWorkersCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    if (workersQuery.empty) {
      return res.json([]);
    }
    
    const workerIds = workersQuery.docs.map(doc => doc.data().workerId);
    
    // Obtener datos de cada trabajador
    const workers = await Promise.all(
      workerIds.map(async (workerId) => {
        const workerDoc = await usersCollection.doc(workerId).get();
        if (workerDoc.exists) {
          const workerData = workerDoc.data();
          return {
            _id: workerDoc.id,
            name: workerData.name,
            email: workerData.email,
            role: workerData.role
          };
        }
        return null;
      })
    );
    
    res.json(workers.filter(worker => worker !== null));
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener trabajadores: ' + error.message);
  }
});

/**
 * @desc    Obtener veterinarios de una granja
 * @route   GET /api/farms/:id/veterinarians
 * @access  Private
 */
const getFarmVeterinarians = asyncHandler(async (req, res) => {
  try {
    // Verificar acceso a la granja
    await checkFarmAccess(req.params.id, req.user.uid);
    
    const vetsQuery = await farmVeterinariansCollection
      .where('farmId', '==', req.params.id)
      .get();
    
    if (vetsQuery.empty) {
      return res.json([]);
    }
    
    const vetIds = vetsQuery.docs.map(doc => doc.data().vetId);
    
    // Obtener datos de cada veterinario
    const vets = await Promise.all(
      vetIds.map(async (vetId) => {
        const vetDoc = await usersCollection.doc(vetId).get();
        if (vetDoc.exists) {
          const vetData = vetDoc.data();
          return {
            _id: vetDoc.id,
            name: vetData.name,
            email: vetData.email,
            role: vetData.role
          };
        }
        return null;
      })
    );
    
    res.json(vets.filter(vet => vet !== null));
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener veterinarios: ' + error.message);
  }
});

/**
 * @desc    Añadir trabajador a una granja
 * @route   POST /api/farms/:id/workers
 * @access  Private
 */
const addWorkerToFarm = asyncHandler(async (req, res) => {
  try {
    const { workerId } = req.body;
    
    if (!workerId) {
      res.status(400);
      throw new Error('Se requiere el ID del trabajador');
    }
    
    // Verificar propiedad de la granja
    const farmRef = farmCollection.doc(req.params.id);
    const farm = await farmRef.get();
    
    if (!farm.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }
    
    if (farm.data().userId !== req.user.uid && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado para gestionar trabajadores de esta granja');
    }
    
    // Verificar que el trabajador existe
    const workerRef = usersCollection.doc(workerId);
    const worker = await workerRef.get();
    
    if (!worker.exists) {
      res.status(404);
      throw new Error('Trabajador no encontrado');
    }
    
    // Verificar que el rol es adecuado
    const workerData = worker.data();
    if (workerData.role !== 'trabajador' && workerData.role !== 'admin') {
      res.status(400);
      throw new Error('El usuario no tiene el rol de trabajador');
    }
    
    // Verificar que aún no esté asociado
    const existingRelation = await farmWorkersCollection
      .where('farmId', '==', req.params.id)
      .where('workerId', '==', workerId)
      .get();
    
    if (!existingRelation.empty) {
      res.status(400);
      throw new Error('El trabajador ya está asociado a esta granja');
    }
    
    // Crear la relación
    const relationData = {
      farmId: req.params.id,
      workerId,
      createdAt: new Date().toISOString()
    };
    
    const relationRef = await farmWorkersCollection.add(relationData);
    
    res.status(201).json({
      _id: relationRef.id,
      ...relationData,
      worker: {
        _id: worker.id,
        name: workerData.name,
        email: workerData.email,
        role: workerData.role
      }
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Añadir veterinario a una granja
 * @route   POST /api/farms/:id/veterinarians
 * @access  Private
 */
const addVeterinarianToFarm = asyncHandler(async (req, res) => {
  try {
    const { vetId } = req.body;
    
    if (!vetId) {
      res.status(400);
      throw new Error('Se requiere el ID del veterinario');
    }
    
    // Verificar propiedad de la granja
    const farmRef = farmCollection.doc(req.params.id);
    const farm = await farmRef.get();
    
    if (!farm.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }
    
    if (farm.data().userId !== req.user.uid && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado para gestionar veterinarios de esta granja');
    }
    
    // Verificar que el veterinario existe
    const vetRef = usersCollection.doc(vetId);
    const vet = await vetRef.get();
    
    if (!vet.exists) {
      res.status(404);
      throw new Error('Veterinario no encontrado');
    }
    
    // Verificar que el rol es adecuado
    const vetData = vet.data();
    if (vetData.role !== 'veterinario' && vetData.role !== 'admin') {
      res.status(400);
      throw new Error('El usuario no tiene el rol de veterinario');
    }
    
    // Verificar que aún no esté asociado
    const existingRelation = await farmVeterinariansCollection
      .where('farmId', '==', req.params.id)
      .where('vetId', '==', vetId)
      .get();
    
    if (!existingRelation.empty) {
      res.status(400);
      throw new Error('El veterinario ya está asociado a esta granja');
    }
    
    // Crear la relación
    const relationData = {
      farmId: req.params.id,
      vetId,
      createdAt: new Date().toISOString()
    };
    
    const relationRef = await farmVeterinariansCollection.add(relationData);
    
    res.status(201).json({
      _id: relationRef.id,
      ...relationData,
      veterinarian: {
        _id: vet.id,
        name: vetData.name,
        email: vetData.email,
        role: vetData.role
      }
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Eliminar trabajador de una granja
 * @route   DELETE /api/farms/:id/workers/:workerId
 * @access  Private
 */
const removeWorkerFromFarm = asyncHandler(async (req, res) => {
  try {
    // Verificar propiedad de la granja
    const farmRef = farmCollection.doc(req.params.id);
    const farm = await farmRef.get();
    
    if (!farm.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }
    
    if (farm.data().userId !== req.user.uid && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado para gestionar trabajadores de esta granja');
    }
    
    // Buscar la relación
    const relationQuery = await farmWorkersCollection
      .where('farmId', '==', req.params.id)
      .where('workerId', '==', req.params.workerId)
      .get();
    
    if (relationQuery.empty) {
      res.status(404);
      throw new Error('Trabajador no asociado a esta granja');
    }
    
    // Eliminar la relación
    await relationQuery.docs[0].ref.delete();
    
    res.json({ message: 'Trabajador eliminado de la granja correctamente' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Eliminar veterinario de una granja
 * @route   DELETE /api/farms/:id/veterinarians/:vetId
 * @access  Private
 */
const removeVeterinarianFromFarm = asyncHandler(async (req, res) => {
  try {
    // Verificar propiedad de la granja
    const farmRef = farmCollection.doc(req.params.id);
    const farm = await farmRef.get();
    
    if (!farm.exists) {
      res.status(404);
      throw new Error('Granja no encontrada');
    }
    
    if (farm.data().userId !== req.user.uid && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado para gestionar veterinarios de esta granja');
    }
    
    // Buscar la relación
    const relationQuery = await farmVeterinariansCollection
      .where('farmId', '==', req.params.id)
      .where('vetId', '==', req.params.vetId)
      .get();
    
    if (relationQuery.empty) {
      res.status(404);
      throw new Error('Veterinario no asociado a esta granja');
    }
    
    // Eliminar la relación
    await relationQuery.docs[0].ref.delete();
    
    res.json({ message: 'Veterinario eliminado de la granja correctamente' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// Funciones auxiliares
async function checkFarmAccess(farmId, userId) {
  // Obtener datos de la granja
  const farmDoc = await farmCollection.doc(farmId).get();
  
  if (!farmDoc.exists) {
    const error = new Error('Granja no encontrada');
    error.statusCode = 404;
    throw error;
  }
  
  const farmData = farmDoc.data();
  
  // Si es propietario, tiene acceso
  if (farmData.userId === userId) {
    return true;
  }
  
  // Verificar si es trabajador
  const isWorker = await checkUserFarmRelation(userId, farmId, 'worker');
  if (isWorker) {
    return true;
  }
  
  // Verificar si es veterinario
  const isVet = await checkUserFarmRelation(userId, farmId, 'vet');
  if (isVet) {
    return true;
  }
  
  // Verificar si es admin
  const userDoc = await usersCollection.doc(userId).get();
  if (userDoc.exists && userDoc.data().role === 'admin') {
    return true;
  }
  
  // No tiene acceso
  const error = new Error('No autorizado para acceder a esta granja');
  error.statusCode = 403;
  throw error;
}

async function checkUserFarmRelation(userId, farmId, relationType) {
  let relationCollection;
  let relationField;
  
  if (relationType === 'worker') {
    relationCollection = farmWorkersCollection;
    relationField = 'workerId';
  } else if (relationType === 'vet') {
    relationCollection = farmVeterinariansCollection;
    relationField = 'vetId';
  } else {
    return false;
  }
  
  const query = await relationCollection
    .where('farmId', '==', farmId)
    .where(relationField, '==', userId)
    .get();
  
  return !query.empty;
}

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmCattle,
  getFarmWorkers,
  getFarmVeterinarians,
  addWorkerToFarm,
  addVeterinarianToFarm,
  removeWorkerFromFarm,
  removeVeterinarianFromFarm
}; 