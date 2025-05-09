const { db } = require('../config/firebase');

const produccionCollection = db.collection('producciones');

/**
 * Crea una nueva producción
 * @param {Object} datos - Datos de la producción
 * @returns {Promise<Object>} - Producción creada
 */
const createProduccion = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await produccionCollection.orderBy('id_produccion', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_produccion + 1;
    }
    
    const produccionData = {
      id_produccion: nuevoId,
      descripcion: datos.descripcion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await produccionCollection.add(produccionData);
    
    return {
      id: docRef.id,
      ...produccionData
    };
  } catch (error) {
    console.error('Error al crear producción:', error);
    throw error;
  }
};

/**
 * Obtiene una producción por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Producción o null si no existe
 */
const getProduccionById = async (id) => {
  try {
    const doc = await produccionCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener producción:', error);
    throw error;
  }
};

/**
 * Obtiene una producción por su ID numérico
 * @param {number} idNumerico - ID numérico de la producción
 * @returns {Promise<Object|null>} - Producción o null si no existe
 */
const getProduccionByNumericId = async (idNumerico) => {
  try {
    const snapshot = await produccionCollection
      .where('id_produccion', '==', parseInt(idNumerico))
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
    console.error('Error al obtener producción por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza una producción
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Producción actualizada
 */
const updateProduccion = async (id, datos) => {
  try {
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await produccionCollection.doc(id).update(updateData);
    
    return await getProduccionById(id);
  } catch (error) {
    console.error('Error al actualizar producción:', error);
    throw error;
  }
};

/**
 * Elimina una producción
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteProduccion = async (id) => {
  try {
    await produccionCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar producción:', error);
    throw error;
  }
};

/**
 * Obtiene todas las producciones
 * @returns {Promise<Array>} - Lista de producciones
 */
const getAllProducciones = async () => {
  try {
    const snapshot = await produccionCollection.orderBy('id_produccion').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener producciones:', error);
    throw error;
  }
};

module.exports = {
  createProduccion,
  getProduccionById,
  getProduccionByNumericId,
  updateProduccion,
  deleteProduccion,
  getAllProducciones
}; 