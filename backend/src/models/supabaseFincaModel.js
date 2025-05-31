const { supabase } = require('../config/supabase');
const usuarioFincaModel = require('./supabaseUsuarioFincaModel');

/**
 * Crea una nueva finca
 * @param {Object} datos - Datos de la finca
 * @returns {Promise<Object>} - Finca creada
 */
const createFinca = async (datos) => {
  try {
    // Verificar si ya existe un ID secuencial
    const { data: lastFinca, error: countError } = await supabase
      .from('finca')
      .select('id_finca')
      .order('id_finca', { ascending: false })
      .limit(1);
    
    if (countError) {
      throw countError;
    }
    
    let nuevoId = 1;
    if (lastFinca && lastFinca.length > 0) {
      nuevoId = lastFinca[0].id_finca + 1;
    }
    
    // Preparar datos para la inserción
    const fincaData = {
      id_finca: nuevoId,
      nombre: datos.nombre,
      tamano: datos.tamano || 0
    };
    
    // Insertar en la tabla finca
    const { data, error } = await supabase
      .from('finca')
      .insert(fincaData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Si hay información de propietario, crear la relación en la tabla usuario_finca
    if (datos.propietario_id) {
      let idUsuario;
      
      // Si el ID del propietario es un UUID, buscar su id_usuario correspondiente
      if (datos.propietario_id.includes('-')) {
        const { data: usuario, error: userError } = await supabase
          .from('usuario')
          .select('id_usuario')
          .eq('id_autentificar', datos.propietario_id)
          .single();
          
        if (userError) {
          console.error('Error al buscar id_usuario:', userError);
          throw userError;
        }
        
        if (usuario) {
          idUsuario = usuario.id_usuario;
        }
      } else {
        // Si ya es un número, usarlo directamente
        idUsuario = parseInt(datos.propietario_id);
      }
      
      if (idUsuario) {
        // Crear la relación en la tabla usuario_finca con rol 'propietario'
        await usuarioFincaModel.asociarUsuarioFinca(idUsuario, data.id_finca, 'propietario');
      }
    }
    
    // Devolver los datos con formato para compatibilidad
    return {
      ...data,
      name: data.nombre,
      size: data.tamano
    };
  } catch (error) {
    console.error('Error al crear finca:', error);
    throw error;
  }
};

/**
 * Obtiene una finca por su ID
 * @param {number} id - ID de la finca
 * @returns {Promise<Object|null>} - Finca o null si no existe
 */
const getFincaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('finca')
      .select(`
        *,
        usuario:usuario(id, primer_nombre, primer_apellido, email)
      `)
      .eq('id_finca', id)
      .single();
    
    if (error) {
      console.error('Error al obtener finca:', error);
      return null;
    }
    
    if (data) {
      return {
        ...data,
        _id: data.id_finca.toString(),
        name: data.nombre,
        size: data.tamano
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener finca:', error);
    throw error;
  }
};

/**
 * Actualiza una finca
 * @param {number} id - ID de la finca
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} - Finca actualizada
 */
const updateFinca = async (id, datos) => {
  try {
    // Verificar si la finca existe
    const { data: finca, error: checkError } = await supabase
      .from('finca')
      .select('id_finca')
      .eq('id_finca', id)
      .single();
    
    if (checkError || !finca) {
      throw new Error(`La finca con ID ${id} no existe`);
    }
    
    // Preparar datos para actualizar
    const updateData = { ...datos };
    
    // Si hay información de área en formato diferente
    if (datos.area && !datos.tamano) {
      updateData.tamano = datos.area;
      delete updateData.area;
    }
    
    // Si hay información de propietario, primero necesitamos obtener el id_usuario a partir del id_autentificar
    if (datos.propietario_id) {
      // Si el ID del propietario es un UUID, buscar su id_usuario correspondiente
      if (datos.propietario_id.includes('-')) {
        const { data: usuario, error: userError } = await supabase
          .from('usuario')
          .select('id_usuario')
          .eq('id_autentificar', datos.propietario_id)
          .single();
          
        if (userError) {
          console.error('Error al buscar id_usuario:', userError);
          throw userError;
        }
        
        if (usuario) {
          updateData.id_usuario = usuario.id_usuario;
        }
      } else {
        // Si ya es un número, usarlo directamente
        updateData.id_usuario = parseInt(datos.propietario_id);
      }
      
      delete updateData.propietario_id;
    }
    
    // Actualizar finca
    const { data, error } = await supabase
      .from('finca')
      .update(updateData)
      .eq('id_finca', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error al actualizar finca:', error);
    throw error;
  }
};

/**
 * Elimina una finca
 * @param {number} id - ID de la finca
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteFinca = async (id) => {
  try {
    // Primero actualizar ganados asociados para quitar la relación
    const { error: updateError } = await supabase
      .from('ganado')
      .update({ id_finca: null })
      .eq('id_finca', id);
    
    if (updateError) {
      console.error('Error al desasociar ganados:', updateError);
    }
    
    // Finalmente eliminar la finca
    const { error } = await supabase
      .from('finca')
      .delete()
      .eq('id_finca', id);
    
    if (error) {
      throw error;
    }
    
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
    const { data, error } = await supabase
      .from('finca')
      .select('*')
      .order('id_finca');
    
    if (error) {
      throw error;
    }
    
    // Para cada finca, buscar su propietario (rol = 'propietario')
    const fincasConPropietarios = await Promise.all(
      data.map(async (finca) => {
        const propietarios = await usuarioFincaModel.getUsuariosByFincaAndRol(finca.id_finca, 'propietario');
        const propietario = propietarios.length > 0 ? propietarios[0] : null;
        
        return {
          ...finca,
          _id: finca.id_finca.toString(),
          name: finca.nombre,
          size: finca.tamano,
          propietario: propietario
        };
      })
    );
    
    return fincasConPropietarios;
  } catch (error) {
    console.error('Error al obtener todas las fincas:', error);
    throw error;
  }
};

/**
 * Obtiene las fincas asociadas a un usuario
 * @param {string} userId - ID del usuario (id_autentificar)
 * @returns {Promise<Array>} - Lista de fincas
 */
const getFincasByOwner = async (userId) => {
  try {
    // Primero obtener el id_usuario a partir del id_autentificar
    const { data: usuario, error: userError } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('id_autentificar', userId)
      .single();
    
    if (userError) {
      console.error('Error al buscar id_usuario:', userError);
      throw userError;
    }
    
    if (!usuario) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Usar el modelo de usuario_finca para obtener las fincas del usuario
    return await usuarioFincaModel.getFincasByUsuario(usuario.id_usuario);
  } catch (error) {
    console.error('Error al obtener fincas del propietario:', error);
    throw error;
  }
};

/**
 * Obtiene los ganados de una finca
 * @param {number} fincaId - ID de la finca
 * @returns {Promise<Array>} - Lista de ganados de la finca
 */
const getFincaGanados = async (fincaId) => {
  try {
    const { data, error } = await supabase
      .from('ganado')
      .select(`
        *,
        informacion_veterinaria:informacion_veterinaria(*),
        produccion:produccion(*),
        estado_salud:estado_salud(*),
        genero:genero(*)
      `)
      .eq('id_finca', fincaId)
      .order('id_ganado');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener ganados de la finca:', error);
    throw error;
  }
};

/**
 * Obtiene todos los trabajadores de una finca
 * @param {number} fincaId - ID de la finca
 * @returns {Promise<Array>} - Lista de usuarios con rol trabajador
 */
const getFincaTrabajadores = async (fincaId) => {
  try {
    return await usuarioFincaModel.getUsuariosByFincaAndRol(fincaId, 'trabajador');
  } catch (error) {
    console.error('Error al obtener trabajadores de la finca:', error);
    throw error;
  }
};

/**
 * Obtiene todos los veterinarios de una finca
 * @param {number} fincaId - ID de la finca
 * @returns {Promise<Array>} - Lista de usuarios con rol veterinario
 */
const getFincaVeterinarios = async (fincaId) => {
  try {
    return await usuarioFincaModel.getUsuariosByFincaAndRol(fincaId, 'veterinario');
  } catch (error) {
    console.error('Error al obtener veterinarios de la finca:', error);
    throw error;
  }
};

module.exports = {
  createFinca,
  getFincaById,
  updateFinca,
  deleteFinca,
  getAllFincas,
  getFincasByOwner,
  getFincaGanados,
  getFincaTrabajadores,
  getFincaVeterinarios
}; 