const { db } = require('../config/firebase');

const ganadoCollection = db.collection('ganados');

/**
 * Crea un nuevo ganado
 * @param {Object} datos - Datos del ganado
 * @returns {Promise<Object>} - Ganado creado
 */
const createGanado = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await ganadoCollection.orderBy('id_ganado', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_ganado + 1;
    }
    
    const ganadoData = {
      id_ganado: nuevoId,
      nombre: datos.nombre,
      numero_identificacion: datos.numero_identificacion,
      precio_compra: datos.precio_compra,
      nota: datos.nota || null,
      // Campos directos en lugar de referencias
      identificador_qr: datos.identificador_qr,
      informacion_veterinaria: datos.informacion_veterinaria,
      produccion: datos.produccion,
      estado_salud: datos.estado_salud,
      genero: datos.genero,
      finca: datos.finca,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Historial de peso, inicialmente vacío
      weightHistory: []
    };
    
    const docRef = await ganadoCollection.add(ganadoData);
    
    return {
      id: docRef.id,
      ...ganadoData
    };
  } catch (error) {
    console.error('Error al crear ganado:', error);
    throw error;
  }
};

/**
 * Obtiene un ganado por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Ganado o null si no existe
 */
const getGanadoById = async (id) => {
  try {
    const doc = await ganadoCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener ganado:', error);
    throw error;
  }
};

/**
 * Obtiene un ganado por su ID numérico
 * @param {number} idNumerico - ID numérico del ganado
 * @returns {Promise<Object|null>} - Ganado o null si no existe
 */
const getGanadoByNumericId = async (idNumerico) => {
  try {
    const snapshot = await ganadoCollection
      .where('id_ganado', '==', parseInt(idNumerico))
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
    console.error('Error al obtener ganado por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza un ganado
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Ganado actualizado
 */
const updateGanado = async (id, datos) => {
  try {
    const ganadoDoc = await ganadoCollection.doc(id).get();
    if (!ganadoDoc.exists) {
      throw new Error(`El ganado con ID ${id} no existe`);
    }
    
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await ganadoCollection.doc(id).update(updateData);
    
    return await getGanadoById(id);
  } catch (error) {
    console.error('Error al actualizar ganado:', error);
    throw error;
  }
};

/**
 * Elimina un ganado
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteGanado = async (id) => {
  try {
    await ganadoCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar ganado:', error);
    throw error;
  }
};

/**
 * Obtiene todos los ganados
 * @returns {Promise<Array>} - Lista de ganados
 */
const getAllGanados = async () => {
  try {
    const snapshot = await ganadoCollection.orderBy('id_ganado').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener ganados:', error);
    throw error;
  }
};

/**
 * Obtiene los ganados por finca
 * @param {string} fincaId - ID de la finca
 * @returns {Promise<Array>} - Lista de ganados de la finca
 */
const getGanadosByFinca = async (fincaId) => {
  try {
    const snapshot = await ganadoCollection
      .where('finca.id', '==', fincaId)
      .orderBy('id_ganado')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener ganados por finca:', error);
    throw error;
  }
};

/**
 * Agrega un registro al historial de peso de un ganado
 * @param {string} id - ID del ganado
 * @param {Object} pesoData - Datos del registro de peso
 * @returns {Promise<Object>} - Ganado actualizado
 */
const addWeightRecord = async (id, pesoData) => {
  try {
    const ganadoDoc = await ganadoCollection.doc(id).get();
    if (!ganadoDoc.exists) {
      throw new Error(`El ganado con ID ${id} no existe`);
    }
    
    const ganado = ganadoDoc.data();
    const weightHistory = ganado.weightHistory || [];
    
    // Agregar el nuevo registro con fecha y hora
    weightHistory.push({
      ...pesoData,
      fecha: pesoData.fecha || new Date().toISOString()
    });
    
    // Ordenar por fecha descendente
    weightHistory.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    await ganadoCollection.doc(id).update({
      weightHistory,
      updatedAt: new Date().toISOString()
    });
    
    return await getGanadoById(id);
  } catch (error) {
    console.error('Error al agregar registro de peso:', error);
    throw error;
  }
};

module.exports = {
  createGanado,
  getGanadoById,
  getGanadoByNumericId,
  updateGanado,
  deleteGanado,
  getAllGanados,
  getGanadosByFinca,
  addWeightRecord
}; 