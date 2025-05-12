const { db } = require('../config/firebase');

const fincaCollection = db.collection('fincas');
const tipoInformeCollection = db.collection('tipos_informe');
const eventoGanaderoCollection = db.collection('eventos_ganaderos');
const usuarioCollection = db.collection('usuarios');

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
    
    // Verificar que existan las referencias
    const tipoInformeDoc = await tipoInformeCollection.doc(datos.tipo_informe_id).get();
    if (!tipoInformeDoc.exists) {
      throw new Error(`El tipo de informe con ID ${datos.tipo_informe_id} no existe`);
    }
    
    const eventoGanaderoDoc = await eventoGanaderoCollection.doc(datos.evento_ganadero_id).get();
    if (!eventoGanaderoDoc.exists) {
      throw new Error(`El evento ganadero con ID ${datos.evento_ganadero_id} no existe`);
    }
    
    const usuarioDoc = await usuarioCollection.doc(datos.usuario_id).get();
    if (!usuarioDoc.exists) {
      throw new Error(`El usuario con ID ${datos.usuario_id} no existe`);
    }
    
    const fincaData = {
      id_finca: nuevoId,
      nombre: datos.nombre,
      tamaño: datos.tamaño,
      // Referencias a otros documentos
      tipo_informe_ref: db.doc(`tipos_informe/${datos.tipo_informe_id}`),
      tipo_informe_id: datos.tipo_informe_id,
      tipo_informe_data: {
        id_tipo_informe: tipoInformeDoc.data().id_tipo_informe,
        descripcion: tipoInformeDoc.data().descripcion
      },
      evento_ganadero_ref: db.doc(`eventos_ganaderos/${datos.evento_ganadero_id}`),
      evento_ganadero_id: datos.evento_ganadero_id,
      evento_ganadero_data: {
        id_evento_ganadero: eventoGanaderoDoc.data().id_evento_ganadero,
        descripcion: eventoGanaderoDoc.data().descripcion
      },
      usuario_ref: db.doc(`usuarios/${datos.usuario_id}`),
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
    
    // Si se actualizan referencias, actualizamos los datos relacionados
    if (datos.tipo_informe_id) {
      const tipoInformeDoc = await tipoInformeCollection.doc(datos.tipo_informe_id).get();
      if (!tipoInformeDoc.exists) {
        throw new Error(`El tipo de informe con ID ${datos.tipo_informe_id} no existe`);
      }
      updateData.tipo_informe_ref = db.doc(`tipos_informe/${datos.tipo_informe_id}`);
      updateData.tipo_informe_data = {
        id_tipo_informe: tipoInformeDoc.data().id_tipo_informe,
        descripcion: tipoInformeDoc.data().descripcion
      };
    }
    
    if (datos.evento_ganadero_id) {
      const eventoGanaderoDoc = await eventoGanaderoCollection.doc(datos.evento_ganadero_id).get();
      if (!eventoGanaderoDoc.exists) {
        throw new Error(`El evento ganadero con ID ${datos.evento_ganadero_id} no existe`);
      }
      updateData.evento_ganadero_ref = db.doc(`eventos_ganaderos/${datos.evento_ganadero_id}`);
      updateData.evento_ganadero_data = {
        id_evento_ganadero: eventoGanaderoDoc.data().id_evento_ganadero,
        descripcion: eventoGanaderoDoc.data().descripcion
      };
    }
    
    if (datos.usuario_id) {
      const usuarioDoc = await usuarioCollection.doc(datos.usuario_id).get();
      if (!usuarioDoc.exists) {
        throw new Error(`El usuario con ID ${datos.usuario_id} no existe`);
      }
      updateData.usuario_ref = db.doc(`usuarios/${datos.usuario_id}`);
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

module.exports = {
  createFinca,
  getFincaById,
  getFincaByNumericId,
  updateFinca,
  deleteFinca,
  getAllFincas,
  getFincasByUsuario
}; 