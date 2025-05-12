const { db } = require('../config/firebase');

const fincaCollection = db.collection('fincas');

/**
 * Crea una nueva finca
 * @param {Object} datos - Datos de la finca
 * @returns {Promise<Object>} - Finca creada
 */
const createFinca = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await fincaCollection.orderBy('id_finca', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_finca + 1;
    }
    
    const fincaData = {
      id_finca: nuevoId,
      nombre: datos.nombre,
      tamaño: datos.tamaño,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await fincaCollection.add(fincaData);
    
    return {
      id: docRef.id,
      ...fincaData
    };
  } catch (error) {
    console.error('Error al crear finca:', error);
    throw error;
  }
};

/**
 * Obtiene una finca por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Finca o null si no existe
 */
const getFincaById = async (id) => {
  try {
    const doc = await fincaCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener finca:', error);
    throw error;
  }
};

/**
 * Obtiene una finca por su ID numérico
 * @param {number} idNumerico - ID numérico de la finca
 * @returns {Promise<Object|null>} - Finca o null si no existe
 */
const getFincaByNumericId = async (idNumerico) => {
  try {
    const snapshot = await fincaCollection
      .where('id_finca', '==', parseInt(idNumerico))
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
    console.error('Error al obtener finca por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza una finca
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Finca actualizada
 */
const updateFinca = async (id, datos) => {
  try {
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await fincaCollection.doc(id).update(updateData);
    
    return await getFincaById(id);
  } catch (error) {
    console.error('Error al actualizar finca:', error);
    throw error;
  }
};

/**
 * Elimina una finca
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteFinca = async (id) => {
  try {
    await fincaCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar finca:', error);
    throw error;
  }
};

/**
 * Obtiene todas las fincas
 * @returns {Promise<Array>} - Lista de fincas
 */
const getAllFincas = async () => {
  try {
    const snapshot = await fincaCollection.orderBy('id_finca').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener fincas:', error);
    throw error;
  }
};

/**
 * Obtiene todas las fincas de un usuario
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<Array>} - Lista de fincas del usuario
 */
const getFincasByUsuario = async (usuarioId) => {
  try {
    const snapshot = await fincaCollection
      .where('usuario.id', '==', usuarioId)
      .orderBy('nombre')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener fincas por usuario:', error);
    throw error;
  }
};

module.exports = {
  createFinca,
  getFincaById,
  getFincaByNumericId,
  updateFinca,
  deleteFinca,
  getAllFincas,
  getFincasByUsuario
}; 