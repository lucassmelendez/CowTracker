const { db } = require('../config/firebase');

const tipoInformeCollection = db.collection('tipos_informe');

/**
 * Crea un nuevo tipo de informe
 * @param {Object} datos - Datos del tipo de informe
 * @returns {Promise<Object>} - Tipo de informe creado
 */
const createTipoInforme = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await tipoInformeCollection.orderBy('id_tipo_informe', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_tipo_informe + 1;
    }
    
    const tipoInformeData = {
      id_tipo_informe: nuevoId,
      descripcion: datos.descripcion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await tipoInformeCollection.add(tipoInformeData);
    
    return {
      id: docRef.id,
      ...tipoInformeData
    };
  } catch (error) {
    console.error('Error al crear tipo de informe:', error);
    throw error;
  }
};

/**
 * Obtiene un tipo de informe por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Tipo de informe o null si no existe
 */
const getTipoInformeById = async (id) => {
  try {
    const doc = await tipoInformeCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener tipo de informe:', error);
    throw error;
  }
};

/**
 * Obtiene un tipo de informe por su ID numérico
 * @param {number} idNumerico - ID numérico del tipo de informe
 * @returns {Promise<Object|null>} - Tipo de informe o null si no existe
 */
const getTipoInformeByNumericId = async (idNumerico) => {
  try {
    const snapshot = await tipoInformeCollection
      .where('id_tipo_informe', '==', parseInt(idNumerico))
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
    console.error('Error al obtener tipo de informe por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza un tipo de informe
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Tipo de informe actualizado
 */
const updateTipoInforme = async (id, datos) => {
  try {
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await tipoInformeCollection.doc(id).update(updateData);
    
    return await getTipoInformeById(id);
  } catch (error) {
    console.error('Error al actualizar tipo de informe:', error);
    throw error;
  }
};

/**
 * Elimina un tipo de informe
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteTipoInforme = async (id) => {
  try {
    await tipoInformeCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar tipo de informe:', error);
    throw error;
  }
};

/**
 * Obtiene todos los tipos de informe
 * @returns {Promise<Array>} - Lista de tipos de informe
 */
const getAllTiposInforme = async () => {
  try {
    const snapshot = await tipoInformeCollection.orderBy('id_tipo_informe').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener tipos de informe:', error);
    throw error;
  }
};

module.exports = {
  createTipoInforme,
  getTipoInformeById,
  getTipoInformeByNumericId,
  updateTipoInforme,
  deleteTipoInforme,
  getAllTiposInforme
}; 