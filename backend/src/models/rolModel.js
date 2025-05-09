const { db } = require('../config/firebase');

const rolCollection = db.collection('roles');

/**
 * Crea un nuevo rol
 * @param {Object} datos - Datos del rol
 * @returns {Promise<Object>} - Rol creado
 */
const createRol = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await rolCollection.orderBy('id_rol', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_rol + 1;
    }
    
    const rolData = {
      id_rol: nuevoId,
      descripcion: datos.descripcion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await rolCollection.add(rolData);
    
    return {
      id: docRef.id,
      ...rolData
    };
  } catch (error) {
    console.error('Error al crear rol:', error);
    throw error;
  }
};

/**
 * Obtiene un rol por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Rol o null si no existe
 */
const getRolById = async (id) => {
  try {
    const doc = await rolCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener rol:', error);
    throw error;
  }
};

/**
 * Obtiene un rol por su ID numérico
 * @param {number} idNumerico - ID numérico del rol
 * @returns {Promise<Object|null>} - Rol o null si no existe
 */
const getRolByNumericId = async (idNumerico) => {
  try {
    const snapshot = await rolCollection
      .where('id_rol', '==', parseInt(idNumerico))
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
    console.error('Error al obtener rol por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza un rol
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Rol actualizado
 */
const updateRol = async (id, datos) => {
  try {
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await rolCollection.doc(id).update(updateData);
    
    return await getRolById(id);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};

/**
 * Elimina un rol
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteRol = async (id) => {
  try {
    await rolCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    throw error;
  }
};

/**
 * Obtiene todos los roles
 * @returns {Promise<Array>} - Lista de roles
 */
const getAllRoles = async () => {
  try {
    const snapshot = await rolCollection.orderBy('id_rol').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw error;
  }
};

module.exports = {
  createRol,
  getRolById,
  getRolByNumericId,
  updateRol,
  deleteRol,
  getAllRoles
}; 