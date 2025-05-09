const { db } = require('../config/firebase');

const generoCollection = db.collection('generos');

/**
 * Crea un nuevo género
 * @param {Object} datos - Datos del género
 * @returns {Promise<Object>} - Género creado
 */
const createGenero = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await generoCollection.orderBy('id_genero', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_genero + 1;
    }
    
    const generoData = {
      id_genero: nuevoId,
      descripcion: datos.descripcion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await generoCollection.add(generoData);
    
    return {
      id: docRef.id,
      ...generoData
    };
  } catch (error) {
    console.error('Error al crear género:', error);
    throw error;
  }
};

/**
 * Obtiene un género por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Género o null si no existe
 */
const getGeneroById = async (id) => {
  try {
    const doc = await generoCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener género:', error);
    throw error;
  }
};

/**
 * Obtiene un género por su ID numérico
 * @param {number} idNumerico - ID numérico del género
 * @returns {Promise<Object|null>} - Género o null si no existe
 */
const getGeneroByNumericId = async (idNumerico) => {
  try {
    const snapshot = await generoCollection
      .where('id_genero', '==', parseInt(idNumerico))
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
    console.error('Error al obtener género por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza un género
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Género actualizado
 */
const updateGenero = async (id, datos) => {
  try {
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await generoCollection.doc(id).update(updateData);
    
    return await getGeneroById(id);
  } catch (error) {
    console.error('Error al actualizar género:', error);
    throw error;
  }
};

/**
 * Elimina un género
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteGenero = async (id) => {
  try {
    await generoCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar género:', error);
    throw error;
  }
};

/**
 * Obtiene todos los géneros
 * @returns {Promise<Array>} - Lista de géneros
 */
const getAllGeneros = async () => {
  try {
    const snapshot = await generoCollection.orderBy('id_genero').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    throw error;
  }
};

module.exports = {
  createGenero,
  getGeneroById,
  getGeneroByNumericId,
  updateGenero,
  deleteGenero,
  getAllGeneros
}; 