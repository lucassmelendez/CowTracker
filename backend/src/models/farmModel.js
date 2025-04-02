const { db } = require('../config/firebase');

const farmsCollection = db.collection('farms');

// Crear una nueva granja
const createFarm = async (farmData) => {
  try {
    const newFarmRef = await farmsCollection.add({
      ...farmData,
      workers: farmData.workers || [],
      veterinarians: farmData.veterinarians || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const newFarm = await newFarmRef.get();
    return { id: newFarm.id, ...newFarm.data() };
  } catch (error) {
    console.error('Error al crear granja:', error);
    throw error;
  }
};

// Obtener todas las granjas
const getAllFarms = async (userId = null) => {
  try {
    let query = farmsCollection;
    
    if (userId) {
      query = query.where('owner', '==', userId);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener granjas:', error);
    throw error;
  }
};

// Obtener una granja por ID
const getFarmById = async (id) => {
  try {
    const farmDoc = await farmsCollection.doc(id).get();
    
    if (!farmDoc.exists) {
      return null;
    }
    
    return { id: farmDoc.id, ...farmDoc.data() };
  } catch (error) {
    console.error('Error al obtener detalles de la granja:', error);
    throw error;
  }
};

// Actualizar una granja
const updateFarm = async (id, farmData) => {
  try {
    const farmRef = farmsCollection.doc(id);
    const farmDoc = await farmRef.get();
    
    if (!farmDoc.exists) {
      throw new Error('Granja no encontrada');
    }
    
    const updatedData = {
      ...farmData,
      updatedAt: new Date().toISOString()
    };
    
    await farmRef.update(updatedData);
    
    return { id, ...updatedData };
  } catch (error) {
    console.error('Error al actualizar granja:', error);
    throw error;
  }
};

// Eliminar una granja
const deleteFarm = async (id) => {
  try {
    await farmsCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar granja:', error);
    throw error;
  }
};

// Añadir un trabajador a una granja
const addWorkerToFarm = async (farmId, workerId) => {
  try {
    const farmRef = farmsCollection.doc(farmId);
    const farmDoc = await farmRef.get();
    
    if (!farmDoc.exists) {
      throw new Error('Granja no encontrada');
    }
    
    const farmData = farmDoc.data();
    const workers = [...(farmData.workers || [])];
    
    if (!workers.includes(workerId)) {
      workers.push(workerId);
      
      await farmRef.update({
        workers,
        updatedAt: new Date().toISOString()
      });
    }
    
    return { id: farmId, ...farmData, workers };
  } catch (error) {
    console.error('Error al añadir trabajador a la granja:', error);
    throw error;
  }
};

// Eliminar un trabajador de una granja
const removeWorkerFromFarm = async (farmId, workerId) => {
  try {
    const farmRef = farmsCollection.doc(farmId);
    const farmDoc = await farmRef.get();
    
    if (!farmDoc.exists) {
      throw new Error('Granja no encontrada');
    }
    
    const farmData = farmDoc.data();
    const workers = [...(farmData.workers || [])];
    
    const updatedWorkers = workers.filter(id => id !== workerId);
    
    await farmRef.update({
      workers: updatedWorkers,
      updatedAt: new Date().toISOString()
    });
    
    return { id: farmId, ...farmData, workers: updatedWorkers };
  } catch (error) {
    console.error('Error al eliminar trabajador de la granja:', error);
    throw error;
  }
};

// Añadir un veterinario a una granja
const addVeterinarianToFarm = async (farmId, veterinarianId) => {
  try {
    const farmRef = farmsCollection.doc(farmId);
    const farmDoc = await farmRef.get();
    
    if (!farmDoc.exists) {
      throw new Error('Granja no encontrada');
    }
    
    const farmData = farmDoc.data();
    const veterinarians = [...(farmData.veterinarians || [])];
    
    if (!veterinarians.includes(veterinarianId)) {
      veterinarians.push(veterinarianId);
      
      await farmRef.update({
        veterinarians,
        updatedAt: new Date().toISOString()
      });
    }
    
    return { id: farmId, ...farmData, veterinarians };
  } catch (error) {
    console.error('Error al añadir veterinario a la granja:', error);
    throw error;
  }
};

// Eliminar un veterinario de una granja
const removeVeterinarianFromFarm = async (farmId, veterinarianId) => {
  try {
    const farmRef = farmsCollection.doc(farmId);
    const farmDoc = await farmRef.get();
    
    if (!farmDoc.exists) {
      throw new Error('Granja no encontrada');
    }
    
    const farmData = farmDoc.data();
    const veterinarians = [...(farmData.veterinarians || [])];
    
    const updatedVeterinarians = veterinarians.filter(id => id !== veterinarianId);
    
    await farmRef.update({
      veterinarians: updatedVeterinarians,
      updatedAt: new Date().toISOString()
    });
    
    return { id: farmId, ...farmData, veterinarians: updatedVeterinarians };
  } catch (error) {
    console.error('Error al eliminar veterinario de la granja:', error);
    throw error;
  }
};

module.exports = {
  createFarm,
  getAllFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  addWorkerToFarm,
  removeWorkerFromFarm,
  addVeterinarianToFarm,
  removeVeterinarianFromFarm
}; 