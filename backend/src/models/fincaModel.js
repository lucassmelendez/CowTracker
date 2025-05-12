const { db } = require('../config/firebase');

const fincaCollection = db.collection('fincas');
const usersCollection = db.collection('users');

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
    
    const usuarioDoc = await usersCollection.doc(datos.usuario_id).get();
    if (!usuarioDoc.exists) {
      throw new Error(`El usuario con ID ${datos.usuario_id} no existe`);
    }
    
    const fincaData = {
      id_finca: nuevoId,
      nombre: datos.nombre,
      tamaño: datos.tamaño,
      // Arrays para almacenar múltiples referencias
      tipos_informe: [], // Array de IDs de tipos de informe
      eventos_ganaderos: [], // Array de IDs de eventos ganaderos
      usuario_id: datos.usuario_id,
      usuario_data: {
        id_usuario: usuarioDoc.data().id_usuario,
        nombre: usuarioDoc.data().primer_nombre + ' ' + usuarioDoc.data().primer_apellido
      },
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
    
    if (datos.usuario_id) {
      const usuarioDoc = await usersCollection.doc(datos.usuario_id).get();
      if (!usuarioDoc.exists) {
        throw new Error(`El usuario con ID ${datos.usuario_id} no existe`);
      }
      updateData.usuario_data = {
        id_usuario: usuarioDoc.data().id_usuario,
        nombre: usuarioDoc.data().primer_nombre + ' ' + usuarioDoc.data().primer_apellido
      };
    }
    
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
      .where('usuario_id', '==', usuarioId)
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

/**
 * Agrega un tipo de informe a una finca
 * @param {string} fincaId - ID de la finca
 * @param {string} tipoInformeId - ID del tipo de informe
 * @returns {Promise<Object>} - Finca actualizada
 */
const addTipoInforme = async (fincaId, tipoInformeId) => {
  try {
    const fincaRef = fincaCollection.doc(fincaId);
    await fincaRef.update({
      tipos_informe: db.FieldValue.arrayUnion(tipoInformeId),
      updatedAt: new Date().toISOString()
    });
    
    return await getFincaById(fincaId);
  } catch (error) {
    console.error('Error al agregar tipo de informe:', error);
    throw error;
  }
};

/**
 * Agrega un evento ganadero a una finca
 * @param {string} fincaId - ID de la finca
 * @param {string} eventoGanaderoId - ID del evento ganadero
 * @returns {Promise<Object>} - Finca actualizada
 */
const addEventoGanadero = async (fincaId, eventoGanaderoId) => {
  try {
    const fincaRef = fincaCollection.doc(fincaId);
    await fincaRef.update({
      eventos_ganaderos: db.FieldValue.arrayUnion(eventoGanaderoId),
      updatedAt: new Date().toISOString()
    });
    
    return await getFincaById(fincaId);
  } catch (error) {
    console.error('Error al agregar evento ganadero:', error);
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
  getFincasByUsuario,
  addTipoInforme,
  addEventoGanadero
}; 