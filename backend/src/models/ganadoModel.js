const { db } = require('../config/firebase');

const ganadoCollection = db.collection('ganados');
const identificadorQRCollection = db.collection('identificadores_qr');
const informacionVeterinariaCollection = db.collection('informacion_veterinaria');
const produccionCollection = db.collection('producciones');
const estadoSaludCollection = db.collection('estados_salud');
const generoCollection = db.collection('generos');
const fincaCollection = db.collection('fincas');

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
    
    const fincaDoc = await fincaCollection.doc(datos.finca_id).get();
    if (!fincaDoc.exists) {
      throw new Error(`La finca con ID ${datos.finca_id} no existe`);
    }
    
    const ganadoData = {
      id_ganado: nuevoId,
      nombre: datos.nombre,
      numero_identificacion: datos.numero_identificacion,
      precio_compra: datos.precio_compra,
      nota: datos.nota || null,
      // IDs de referencias
      identificador_qr_id: datos.identificador_qr_id,
      informacion_veterinaria_id: datos.informacion_veterinaria_id,
      produccion_id: datos.produccion_id,
      estado_salud_id: datos.estado_salud_id,
      genero_id: datos.genero_id,
      finca_id: datos.finca_id,
      finca_data: {
        id_finca: fincaDoc.data().id_finca,
        nombre: fincaDoc.data().nombre
      },
      // Arrays para historiales y eventos
      historial_peso: [],
      historial_salud: [],
      historial_produccion: [],
      eventos_ganaderos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    
    if (datos.finca_id) {
      const fincaDoc = await fincaCollection.doc(datos.finca_id).get();
      if (!fincaDoc.exists) {
        throw new Error(`La finca con ID ${datos.finca_id} no existe`);
      }
      updateData.finca_data = {
        id_finca: fincaDoc.data().id_finca,
        nombre: fincaDoc.data().nombre
      };
    }
    
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
 * Obtiene todos los ganados de una finca
 * @param {string} fincaId - ID de la finca
 * @returns {Promise<Array>} - Lista de ganados de la finca
 */
const getGanadosByFinca = async (fincaId) => {
  try {
    const snapshot = await ganadoCollection
      .where('finca_id', '==', fincaId)
      .orderBy('nombre')
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
 * Agrega un registro de peso al historial
 * @param {string} id - ID del ganado
 * @param {Object} pesoData - Datos del peso
 * @returns {Promise<Object>} - Ganado actualizado
 */
const addPeso = async (id, pesoData) => {
  try {
    const ganadoRef = ganadoCollection.doc(id);
    await ganadoRef.update({
      historial_peso: db.FieldValue.arrayUnion({
        ...pesoData,
        fecha: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });
    
    return await getGanadoById(id);
  } catch (error) {
    console.error('Error al agregar peso:', error);
    throw error;
  }
};

/**
 * Agrega un registro de salud al historial
 * @param {string} id - ID del ganado
 * @param {Object} saludData - Datos de salud
 * @returns {Promise<Object>} - Ganado actualizado
 */
const addSalud = async (id, saludData) => {
  try {
    const ganadoRef = ganadoCollection.doc(id);
    await ganadoRef.update({
      historial_salud: db.FieldValue.arrayUnion({
        ...saludData,
        fecha: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });
    
    return await getGanadoById(id);
  } catch (error) {
    console.error('Error al agregar registro de salud:', error);
    throw error;
  }
};

/**
 * Agrega un registro de producción al historial
 * @param {string} id - ID del ganado
 * @param {Object} produccionData - Datos de producción
 * @returns {Promise<Object>} - Ganado actualizado
 */
const addProduccion = async (id, produccionData) => {
  try {
    const ganadoRef = ganadoCollection.doc(id);
    await ganadoRef.update({
      historial_produccion: db.FieldValue.arrayUnion({
        ...produccionData,
        fecha: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });
    
    return await getGanadoById(id);
  } catch (error) {
    console.error('Error al agregar registro de producción:', error);
    throw error;
  }
};

/**
 * Agrega un evento ganadero al ganado
 * @param {string} id - ID del ganado
 * @param {string} eventoId - ID del evento ganadero
 * @returns {Promise<Object>} - Ganado actualizado
 */
const addEventoGanadero = async (id, eventoId) => {
  try {
    const ganadoRef = ganadoCollection.doc(id);
    await ganadoRef.update({
      eventos_ganaderos: db.FieldValue.arrayUnion(eventoId),
      updatedAt: new Date().toISOString()
    });
    
    return await getGanadoById(id);
  } catch (error) {
    console.error('Error al agregar evento ganadero:', error);
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
  addPeso,
  addSalud,
  addProduccion,
  addEventoGanadero
}; 