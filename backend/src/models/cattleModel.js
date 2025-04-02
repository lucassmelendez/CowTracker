const { db } = require('../config/firebase');

const cattleCollection = db.collection('cattle');

// Crear un nuevo registro de ganado
const createCattle = async (cattleData) => {
  try {
    const newCattleRef = await cattleCollection.add({
      ...cattleData,
      weightHistory: cattleData.weight ? [{
        date: new Date().toISOString(),
        weight: cattleData.weight,
        notes: 'Peso inicial',
      }] : [],
      medicalHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const newCattle = await newCattleRef.get();
    return { id: newCattle.id, ...newCattle.data() };
  } catch (error) {
    console.error('Error al crear ganado:', error);
    throw error;
  }
};

// Obtener todos los registros de ganado
const getAllCattle = async (userId = null, farmId = null) => {
  try {
    let query = cattleCollection;
    
    if (userId) {
      query = query.where('owner', '==', userId);
    }
    
    if (farmId) {
      query = query.where('location.farm', '==', farmId);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener ganado:', error);
    throw error;
  }
};

// Obtener un registro de ganado por ID
const getCattleById = async (id) => {
  try {
    const cattleDoc = await cattleCollection.doc(id).get();
    
    if (!cattleDoc.exists) {
      return null;
    }
    
    return { id: cattleDoc.id, ...cattleDoc.data() };
  } catch (error) {
    console.error('Error al obtener detalles del ganado:', error);
    throw error;
  }
};

// Actualizar un registro de ganado
const updateCattle = async (id, cattleData) => {
  try {
    const cattleRef = cattleCollection.doc(id);
    const cattleDoc = await cattleRef.get();
    
    if (!cattleDoc.exists) {
      throw new Error('Ganado no encontrado');
    }
    
    const currentData = cattleDoc.data();
    
    // Actualizar el historial de peso si cambió
    let updatedWeightHistory = [...(currentData.weightHistory || [])];
    if (cattleData.weight && cattleData.weight !== currentData.weight) {
      updatedWeightHistory.push({
        date: new Date().toISOString(),
        weight: cattleData.weight,
        notes: 'Actualización de peso'
      });
    }
    
    const updatedData = {
      ...cattleData,
      weightHistory: updatedWeightHistory,
      updatedAt: new Date().toISOString()
    };
    
    await cattleRef.update(updatedData);
    
    return { id, ...updatedData };
  } catch (error) {
    console.error('Error al actualizar ganado:', error);
    throw error;
  }
};

// Eliminar un registro de ganado
const deleteCattle = async (id) => {
  try {
    await cattleCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar ganado:', error);
    throw error;
  }
};

// Añadir un registro médico
const addMedicalRecord = async (cattleId, medicalData) => {
  try {
    const cattleRef = cattleCollection.doc(cattleId);
    const cattleDoc = await cattleRef.get();
    
    if (!cattleDoc.exists) {
      throw new Error('Ganado no encontrado');
    }
    
    const currentData = cattleDoc.data();
    const medicalHistory = [...(currentData.medicalHistory || [])];
    
    const newRecord = {
      ...medicalData,
      date: medicalData.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    medicalHistory.push(newRecord);
    
    await cattleRef.update({
      medicalHistory,
      updatedAt: new Date().toISOString()
    });
    
    return { id: cattleId, ...currentData, medicalHistory };
  } catch (error) {
    console.error('Error al añadir registro médico:', error);
    throw error;
  }
};

module.exports = {
  createCattle,
  getAllCattle,
  getCattleById,
  updateCattle,
  deleteCattle,
  addMedicalRecord
}; 