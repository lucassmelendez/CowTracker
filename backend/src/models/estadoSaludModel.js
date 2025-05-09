const { db } = require('../config/firebase');

const estadoSaludCollection = db.collection('estados_salud');

/**
 * Crear un nuevo estado de salud
 * @param {Object} datos - Datos del estado de salud
 * @returns {Promise<Object>} - Estado de salud creado
 */
const createEstadoSalud = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await estadoSaludCollection.orderBy('id_estado_salud', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_estado_salud + 1;
    }
    
    const estadoSaludData = {
      id_estado_salud: nuevoId,
      descripcion: datos.descripcion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await estadoSaludCollection.add(estadoSaludData);
    
    return {
      id: docRef.id,
      ...estadoSaludData
    };
  } catch (error) {
    console.error('Error al crear estado de salud:', error);
    throw error;
  }
};

/**
 * Obtener un estado de salud por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Estado de salud o null si no existe
 */
const getEstadoSaludById = async (id) => {
  try {
    const doc = await estadoSaludCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener estado de salud:', error);
    throw error;
  }
};

/**
 * Obtener un estado de salud por su ID numérico
 * @param {number} idNumerico - ID numérico del estado de salud
 * @returns {Promise<Object|null>} - Estado de salud o null si no existe
 */
const getEstadoSaludByNumericId = async (idNumerico) => {
  try {
    const snapshot = await estadoSaludCollection
      .where('id_estado_salud', '==', parseInt(idNumerico))
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener estado de salud por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualizar un estado de salud
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Estado de salud actualizado
 */
const updateEstadoSalud = async (id, datos) => {
  try {
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await estadoSaludCollection.doc(id).update(updateData);
    
    return await getEstadoSaludById(id);
  } catch (error) {
    console.error('Error al actualizar estado de salud:', error);
    throw error;
  }
};

/**
 * Eliminar un estado de salud
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteEstadoSalud = async (id) => {
  try {
    await estadoSaludCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar estado de salud:', error);
    throw error;
  }
};

/**
 * Obtener todos los estados de salud
 * @returns {Promise<Array>} - Lista de estados de salud
 */
const getAllEstadosSalud = async () => {
  try {
    const snapshot = await estadoSaludCollection.orderBy('id_estado_salud').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener estados de salud:', error);
    throw error;
  }
};

module.exports = {
  createEstadoSalud,
  getEstadoSaludById,
  getEstadoSaludByNumericId,
  updateEstadoSalud,
  deleteEstadoSalud,
  getAllEstadosSalud
}; 