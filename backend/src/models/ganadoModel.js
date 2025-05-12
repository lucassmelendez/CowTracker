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
    
    // Verificar que existan las referencias
    const identificadorQRDoc = await identificadorQRCollection.doc(datos.identificador_qr_id).get();
    if (!identificadorQRDoc.exists) {
      throw new Error(`El identificador QR con ID ${datos.identificador_qr_id} no existe`);
    }
    
    const informacionVeterinariaDoc = await informacionVeterinariaCollection.doc(datos.informacion_veterinaria_id).get();
    if (!informacionVeterinariaDoc.exists) {
      throw new Error(`La información veterinaria con ID ${datos.informacion_veterinaria_id} no existe`);
    }
    
    const produccionDoc = await produccionCollection.doc(datos.produccion_id).get();
    if (!produccionDoc.exists) {
      throw new Error(`La producción con ID ${datos.produccion_id} no existe`);
    }
    
    const estadoSaludDoc = await estadoSaludCollection.doc(datos.estado_salud_id).get();
    if (!estadoSaludDoc.exists) {
      throw new Error(`El estado de salud con ID ${datos.estado_salud_id} no existe`);
    }
    
    const generoDoc = await generoCollection.doc(datos.genero_id).get();
    if (!generoDoc.exists) {
      throw new Error(`El género con ID ${datos.genero_id} no existe`);
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
      // Referencias a otros documentos
      identificador_qr_ref: db.doc(`identificadores_qr/${datos.identificador_qr_id}`),
      identificador_qr_id: datos.identificador_qr_id,
      identificador_qr_data: {
        id_identificador_qr: identificadorQRDoc.data().id_identificador_qr,
        descripcion: identificadorQRDoc.data().descripcion
      },
      informacion_veterinaria_ref: db.doc(`informacion_veterinaria/${datos.informacion_veterinaria_id}`),
      informacion_veterinaria_id: datos.informacion_veterinaria_id,
      produccion_ref: db.doc(`producciones/${datos.produccion_id}`),
      produccion_id: datos.produccion_id,
      produccion_data: {
        id_produccion: produccionDoc.data().id_produccion,
        descripcion: produccionDoc.data().descripcion
      },
      estado_salud_ref: db.doc(`estados_salud/${datos.estado_salud_id}`),
      estado_salud_id: datos.estado_salud_id,
      estado_salud_data: {
        id_estado_salud: estadoSaludDoc.data().id_estado_salud,
        descripcion: estadoSaludDoc.data().descripcion
      },
      genero_ref: db.doc(`generos/${datos.genero_id}`),
      genero_id: datos.genero_id,
      genero_data: {
        id_genero: generoDoc.data().id_genero,
        descripcion: generoDoc.data().descripcion
      },
      finca_ref: db.doc(`fincas/${datos.finca_id}`),
      finca_id: datos.finca_id,
      finca_data: {
        id_finca: fincaDoc.data().id_finca,
        nombre: fincaDoc.data().nombre
      },
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
    
    const ganadoActual = ganadoDoc.data();
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    // Si se actualizan referencias, actualizamos los datos relacionados
    if (datos.identificador_qr_id) {
      const identificadorQRDoc = await identificadorQRCollection.doc(datos.identificador_qr_id).get();
      if (!identificadorQRDoc.exists) {
        throw new Error(`El identificador QR con ID ${datos.identificador_qr_id} no existe`);
      }
      updateData.identificador_qr_ref = db.doc(`identificadores_qr/${datos.identificador_qr_id}`);
      updateData.identificador_qr_data = {
        id_identificador_qr: identificadorQRDoc.data().id_identificador_qr,
        descripcion: identificadorQRDoc.data().descripcion
      };
    }
    
    if (datos.informacion_veterinaria_id) {
      const informacionVeterinariaDoc = await informacionVeterinariaCollection.doc(datos.informacion_veterinaria_id).get();
      if (!informacionVeterinariaDoc.exists) {
        throw new Error(`La información veterinaria con ID ${datos.informacion_veterinaria_id} no existe`);
      }
      updateData.informacion_veterinaria_ref = db.doc(`informacion_veterinaria/${datos.informacion_veterinaria_id}`);
    }
    
    if (datos.produccion_id) {
      const produccionDoc = await produccionCollection.doc(datos.produccion_id).get();
      if (!produccionDoc.exists) {
        throw new Error(`La producción con ID ${datos.produccion_id} no existe`);
      }
      updateData.produccion_ref = db.doc(`producciones/${datos.produccion_id}`);
      updateData.produccion_data = {
        id_produccion: produccionDoc.data().id_produccion,
        descripcion: produccionDoc.data().descripcion
      };
    }
    
    if (datos.estado_salud_id) {
      const estadoSaludDoc = await estadoSaludCollection.doc(datos.estado_salud_id).get();
      if (!estadoSaludDoc.exists) {
        throw new Error(`El estado de salud con ID ${datos.estado_salud_id} no existe`);
      }
      updateData.estado_salud_ref = db.doc(`estados_salud/${datos.estado_salud_id}`);
      updateData.estado_salud_data = {
        id_estado_salud: estadoSaludDoc.data().id_estado_salud,
        descripcion: estadoSaludDoc.data().descripcion
      };
    }
    
    if (datos.genero_id) {
      const generoDoc = await generoCollection.doc(datos.genero_id).get();
      if (!generoDoc.exists) {
        throw new Error(`El género con ID ${datos.genero_id} no existe`);
      }
      updateData.genero_ref = db.doc(`generos/${datos.genero_id}`);
      updateData.genero_data = {
        id_genero: generoDoc.data().id_genero,
        descripcion: generoDoc.data().descripcion
      };
    }
    
    if (datos.finca_id) {
      const fincaDoc = await fincaCollection.doc(datos.finca_id).get();
      if (!fincaDoc.exists) {
        throw new Error(`La finca con ID ${datos.finca_id} no existe`);
      }
      updateData.finca_ref = db.doc(`fincas/${datos.finca_id}`);
      updateData.finca_data = {
        id_finca: fincaDoc.data().id_finca,
        nombre: fincaDoc.data().nombre
      };
    }
    
    // Actualizar historial de peso si el peso cambió
    if (datos.peso && datos.peso !== ganadoActual.peso) {
      updateData.weightHistory = [
        ...(ganadoActual.weightHistory || []),
        {
          date: new Date().toISOString(),
          weight: datos.peso,
          notes: 'Actualización de peso'
        }
      ];
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

module.exports = {
  createGanado,
  getGanadoById,
  getGanadoByNumericId,
  updateGanado,
  deleteGanado,
  getAllGanados,
  getGanadosByFinca
}; 