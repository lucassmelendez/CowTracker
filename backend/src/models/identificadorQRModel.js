const { db } = require('../config/firebase');

const identificadorQRCollection = db.collection('identificadores_qr');

/**
 * Crea un nuevo identificador QR
 * @param {Object} datos - Datos del identificador QR
 * @returns {Promise<Object>} - Identificador QR creado
 */
const createIdentificadorQR = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await identificadorQRCollection.orderBy('id_identificador_qr', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_identificador_qr + 1;
    }
    
    const identificadorQRData = {
      id_identificador_qr: nuevoId,
      descripcion: datos.descripcion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await identificadorQRCollection.add(identificadorQRData);
    
    return {
      id: docRef.id,
      ...identificadorQRData
    };
  } catch (error) {
    console.error('Error al crear identificador QR:', error);
    throw error;
  }
};

/**
 * Obtiene un identificador QR por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Identificador QR o null si no existe
 */
const getIdentificadorQRById = async (id) => {
  try {
    const doc = await identificadorQRCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener identificador QR:', error);
    throw error;
  }
};

/**
 * Obtiene un identificador QR por su ID numérico
 * @param {number} idNumerico - ID numérico del identificador QR
 * @returns {Promise<Object|null>} - Identificador QR o null si no existe
 */
const getIdentificadorQRByNumericId = async (idNumerico) => {
  try {
    const snapshot = await identificadorQRCollection
      .where('id_identificador_qr', '==', parseInt(idNumerico))
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
    console.error('Error al obtener identificador QR por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza un identificador QR
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Identificador QR actualizado
 */
const updateIdentificadorQR = async (id, datos) => {
  try {
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await identificadorQRCollection.doc(id).update(updateData);
    
    return await getIdentificadorQRById(id);
  } catch (error) {
    console.error('Error al actualizar identificador QR:', error);
    throw error;
  }
};

/**
 * Elimina un identificador QR
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteIdentificadorQR = async (id) => {
  try {
    await identificadorQRCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar identificador QR:', error);
    throw error;
  }
};

/**
 * Obtiene todos los identificadores QR
 * @returns {Promise<Array>} - Lista de identificadores QR
 */
const getAllIdentificadoresQR = async () => {
  try {
    const snapshot = await identificadorQRCollection.orderBy('id_identificador_qr').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener identificadores QR:', error);
    throw error;
  }
};

module.exports = {
  createIdentificadorQR,
  getIdentificadorQRById,
  getIdentificadorQRByNumericId,
  updateIdentificadorQR,
  deleteIdentificadorQR,
  getAllIdentificadoresQR
}; 