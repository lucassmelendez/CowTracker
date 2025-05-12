const { db } = require('../config/firebase');

const informacionVeterinariaCollection = db.collection('informacion_veterinaria');

/**
 * Crea una nueva información veterinaria
 * @param {Object} datos - Datos de la información veterinaria
 * @returns {Promise<Object>} - Información veterinaria creada
 */
const createInformacionVeterinaria = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const snapshot = await informacionVeterinariaCollection.orderBy('id_informacion_veterinaria', 'desc').limit(1).get();
    let nuevoId = 1;
    
    if (!snapshot.empty) {
      nuevoId = snapshot.docs[0].data().id_informacion_veterinaria + 1;
    }
    
    // Convertir la fecha a formato ISO si existe
    let fechaTratamiento = null;
    if (datos.fecha_tratamiento) {
      if (datos.fecha_tratamiento instanceof Date) {
        fechaTratamiento = datos.fecha_tratamiento.toISOString();
      } else {
        // Si es un string, verificamos si es válido como fecha
        const fechaComoDate = new Date(datos.fecha_tratamiento);
        if (!isNaN(fechaComoDate.getTime())) {
          fechaTratamiento = fechaComoDate.toISOString();
        }
      }
    }
    
    const informacionVeterinariaData = {
      id_informacion_veterinaria: nuevoId,
      fecha_tratamiento: fechaTratamiento,
      diagnostico: datos.diagnostico || null,
      tratamiento: datos.tratamiento || null,
      nota: datos.nota || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await informacionVeterinariaCollection.add(informacionVeterinariaData);
    
    return {
      id: docRef.id,
      ...informacionVeterinariaData
    };
  } catch (error) {
    console.error('Error al crear información veterinaria:', error);
    throw error;
  }
};

/**
 * Obtiene una información veterinaria por su ID
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<Object|null>} - Información veterinaria o null si no existe
 */
const getInformacionVeterinariaById = async (id) => {
  try {
    const doc = await informacionVeterinariaCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener información veterinaria:', error);
    throw error;
  }
};

/**
 * Obtiene una información veterinaria por su ID numérico
 * @param {number} idNumerico - ID numérico de la información veterinaria
 * @returns {Promise<Object|null>} - Información veterinaria o null si no existe
 */
const getInformacionVeterinariaByNumericId = async (idNumerico) => {
  try {
    const snapshot = await informacionVeterinariaCollection
      .where('id_informacion_veterinaria', '==', parseInt(idNumerico))
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
    console.error('Error al obtener información veterinaria por ID numérico:', error);
    throw error;
  }
};

/**
 * Actualiza una información veterinaria
 * @param {string} id - ID del documento en Firestore
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Información veterinaria actualizada
 */
const updateInformacionVeterinaria = async (id, datos) => {
  try {
    // Procesar fecha de tratamiento si existe
    if (datos.fecha_tratamiento) {
      if (datos.fecha_tratamiento instanceof Date) {
        datos.fecha_tratamiento = datos.fecha_tratamiento.toISOString();
      } else {
        // Si es un string, verificamos si es válido como fecha
        const fechaComoDate = new Date(datos.fecha_tratamiento);
        if (!isNaN(fechaComoDate.getTime())) {
          datos.fecha_tratamiento = fechaComoDate.toISOString();
        }
      }
    }
    
    const updateData = {
      ...datos,
      updatedAt: new Date().toISOString()
    };
    
    await informacionVeterinariaCollection.doc(id).update(updateData);
    
    return await getInformacionVeterinariaById(id);
  } catch (error) {
    console.error('Error al actualizar información veterinaria:', error);
    throw error;
  }
};

/**
 * Elimina una información veterinaria
 * @param {string} id - ID del documento en Firestore
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteInformacionVeterinaria = async (id) => {
  try {
    await informacionVeterinariaCollection.doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error al eliminar información veterinaria:', error);
    throw error;
  }
};

/**
 * Obtiene todas las informaciones veterinarias
 * @returns {Promise<Array>} - Lista de informaciones veterinarias
 */
const getAllInformacionesVeterinarias = async () => {
  try {
    const snapshot = await informacionVeterinariaCollection.orderBy('id_informacion_veterinaria').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener informaciones veterinarias:', error);
    throw error;
  }
};

module.exports = {
  createInformacionVeterinaria,
  getInformacionVeterinariaById,
  getInformacionVeterinariaByNumericId,
  updateInformacionVeterinaria,
  deleteInformacionVeterinaria,
  getAllInformacionesVeterinarias
}; 