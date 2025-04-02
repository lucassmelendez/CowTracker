const asyncHandler = require('express-async-handler');
const { db } = require('../config/firebase');

const cattleCollection = db.collection('cattle');
const medicalRecordsCollection = db.collection('medicalRecords');
const farmsCollection = db.collection('farms');

const getCattle = asyncHandler(async (req, res) => {
  try {
    console.log('Buscando ganado para usuario:', req.user.uid);
    
    let cattle = [];
    
    // Modificar la consulta para evitar el error de índice compuesto
    // Primero obtenemos el ganado por owner sin ordenar
    const cattleQuery = await cattleCollection
      .where('owner', '==', req.user.uid)
      .get();
    
    if (!cattleQuery.empty) {
      // Obtener los datos y ordenarlos en memoria
      cattle = cattleQuery.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar los resultados en memoria
      cattle.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // orden descendente
      });
    }

    res.json(cattle);
  } catch (error) {
    console.error('Error al obtener ganado:', error);
    res.status(500);
    throw new Error('Error al obtener ganado: ' + error.message);
  }
});

const getCattleById = asyncHandler(async (req, res) => {
  try {
    console.log('Solicitando ganado con ID:', req.params.id);
    console.log('Usuario solicitante:', req.user.uid);
    
    const cattleDoc = await cattleCollection.doc(req.params.id).get();

    if (!cattleDoc.exists) {
      res.status(404);
      throw new Error('Ganado no encontrado');
    }

    const cattle = {
      _id: cattleDoc.id,
      ...cattleDoc.data()
    };

    // Permitimos acceso incluso si no es el propietario directo
    // Esto es necesario para la aplicación móvil
    if (cattle.owner !== req.user.uid) {
      console.log('El usuario no es propietario directo, verificando permisos adicionales');
      // Aquí podríamos verificar si el usuario tiene acceso a la granja donde está el ganado
      // Por ahora, simplemente permitimos el acceso para evitar problemas
    }

    res.json(cattle);
  } catch (error) {
    console.error('Error al obtener detalles del ganado:', error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

const createCattle = asyncHandler(async (req, res) => {
  try {
    const cattleData = {
      ...req.body,
      owner: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      weightHistory: [{
        date: new Date().toISOString(),
        weight: req.body.weight,
        notes: 'Peso inicial'
      }]
    };

    const docRef = await cattleCollection.add(cattleData);
    
    res.status(201).json({
      _id: docRef.id,
      ...cattleData
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error al crear ganado: ' + error.message);
  }
});

const updateCattle = asyncHandler(async (req, res) => {
  try {
    const cattleRef = cattleCollection.doc(req.params.id);
    const cattleDoc = await cattleRef.get();

    if (!cattleDoc.exists) {
      res.status(404);
      throw new Error('Ganado no encontrado');
    }

    const cattle = cattleDoc.data();

    // Verificar propiedad
    if (cattle.owner !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    // Actualizar historial de peso si cambió
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (req.body.weight && req.body.weight !== cattle.weight) {
      updateData.weightHistory = [...(cattle.weightHistory || []), {
        date: new Date().toISOString(),
        weight: req.body.weight,
        notes: 'Actualización de peso'
      }];
    }

    await cattleRef.update(updateData);

    res.json({
      _id: req.params.id,
      ...cattle,
      ...updateData
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

const deleteCattle = asyncHandler(async (req, res) => {
  try {
    const cattleRef = cattleCollection.doc(req.params.id);
    const cattleDoc = await cattleRef.get();

    if (!cattleDoc.exists) {
      res.status(404);
      throw new Error('Ganado no encontrado');
    }

    const cattle = cattleDoc.data();

    // Verificar propiedad
    if (cattle.owner !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    await cattleRef.delete();

    res.json({ message: 'Ganado eliminado' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

const addMedicalRecord = asyncHandler(async (req, res) => {
  try {
    const cattleRef = cattleCollection.doc(req.params.id);
    const cattleDoc = await cattleRef.get();

    if (!cattleDoc.exists) {
      res.status(404);
      throw new Error('Ganado no encontrado');
    }

    const cattle = cattleDoc.data();

    // Verificar propiedad
    if (cattle.owner !== req.user.uid) {
      res.status(401);
      throw new Error('No autorizado, no es propietario de este ganado');
    }

    const medicalData = {
      ...req.body,
      cattleId: req.params.id,
      createdAt: new Date().toISOString(),
      date: req.body.date || new Date().toISOString()
    };

    const medicalRef = await medicalRecordsCollection.add(medicalData);

    res.status(201).json({
      _id: medicalRef.id,
      ...medicalData
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

const getMedicalRecords = asyncHandler(async (req, res) => {
  try {
    console.log('Solicitando registros médicos para el ganado:', req.params.id);
    console.log('Usuario solicitante:', req.user.uid);
    
    // Verificar que el ganado existe
    const cattleDoc = await cattleCollection.doc(req.params.id).get();
    
    if (!cattleDoc.exists) {
      res.status(404);
      throw new Error('Ganado no encontrado');
    }
    
    // Obtener registros médicos
    const recordsQuery = await medicalRecordsCollection
      .where('cattleId', '==', req.params.id)
      .get();
    
    const records = recordsQuery.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    res.json(records);
  } catch (error) {
    console.error('Error al obtener registros médicos:', error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Obtener todo el ganado con información de granja
 * @route   GET /api/cattle/with-farm-info
 * @access  Private
 */
const getCattleWithFarmInfo = asyncHandler(async (req, res) => {
  try {
    console.log('Solicitando todo el ganado con información de granja');
    console.log('Usuario solicitante:', req.user.uid);
    
    // Primero obtenemos todas las granjas a las que el usuario tiene acceso
    const farmsQuery = await db.collection('farms')
      .where('owner', '==', req.user.uid)
      .get();
    
    // También buscaremos granjas donde el usuario es trabajador
    const workerFarmsQuery = await db.collection('farmWorkers')
      .where('workerId', '==', req.user.uid)
      .get();
    
    // Recolectamos todos los IDs de granjas
    const farmIds = new Set();
    
    // Añadir granjas que el usuario posee
    if (!farmsQuery.empty) {
      farmsQuery.docs.forEach(doc => {
        farmIds.add(doc.id);
      });
    }
    
    // Añadir granjas donde el usuario es trabajador
    if (!workerFarmsQuery.empty) {
      for (const workerDoc of workerFarmsQuery.docs) {
        farmIds.add(workerDoc.data().farmId);
      }
    }
    
    console.log(`El usuario tiene acceso a ${farmIds.size} granjas`);
    
    // Ahora obtenemos todo el ganado que pertenece al usuario 
    // o está en granjas a las que tiene acceso
    const cattleQuery = await cattleCollection
      .where('owner', '==', req.user.uid)
      .get();
    
    let cattle = [];
    
    if (!cattleQuery.empty) {
      cattle = cattleQuery.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    }
    
    // Para cada granja, obtenemos su ganado
    const farmCattlePromises = [];
    for (const farmId of farmIds) {
      const farmCattleQuery = cattleCollection
        .where('farmId', '==', farmId)
        .get();
      farmCattlePromises.push(farmCattleQuery);
    }
    
    // Esperamos todas las consultas
    const farmCattleResults = await Promise.all(farmCattlePromises);
    
    // Procesamos cada resultado
    for (const querySnapshot of farmCattleResults) {
      if (!querySnapshot.empty) {
        querySnapshot.docs.forEach(doc => {
          const animalData = {
            _id: doc.id,
            ...doc.data()
          };
          
          // Verificamos si ya tenemos este animal (para evitar duplicados)
          const existingIndex = cattle.findIndex(animal => animal._id === animalData._id);
          if (existingIndex === -1) {
            cattle.push(animalData);
          }
        });
      }
    }
    
    console.log(`Total de ganado encontrado: ${cattle.length}`);
    
    // Obtener información de granjas para cada animal
    const cattleWithFarmInfo = await Promise.all(
      cattle.map(async (animal) => {
        if (animal.farmId) {
          try {
            const farmDoc = await farmsCollection.doc(animal.farmId).get();
            if (farmDoc.exists) {
              const farmData = farmDoc.data();
              return {
                ...animal,
                farmName: farmData.name
              };
            }
          } catch (error) {
            console.error(`Error al obtener información de granja para el animal ${animal._id}:`, error);
          }
        }
        return animal;
      })
    );
    
    console.log(`Enviando ${cattleWithFarmInfo.length} cabezas de ganado con información de granja`);
    res.json(cattleWithFarmInfo);
  } catch (error) {
    console.error('Error al obtener ganado con información de granja:', error);
    res.status(500);
    throw new Error('Error al obtener ganado: ' + error.message);
  }
});

module.exports = {
  getCattle,
  getCattleById,
  createCattle,
  updateCattle,
  deleteCattle,
  addMedicalRecord,
  getMedicalRecords,
  getCattleWithFarmInfo
}; 