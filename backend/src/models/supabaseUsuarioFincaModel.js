const { supabase } = require('../config/supabase');

/**
 * Asocia un usuario a una finca con un rol específico
 * @param {number} idUsuario - ID del usuario
 * @param {number} idFinca - ID de la finca
 * @param {string} rol - Rol del usuario en la finca (propietario, trabajador, veterinario)
 * @returns {Promise<Object>} - Relación creada
 */
const asociarUsuarioFinca = async (idUsuario, idFinca, rol = 'trabajador') => {
  try {
    // Verificar si ya existe esta relación
    const { data: existingRelation, error: checkError } = await supabase
      .from('usuario_finca')
      .select('id_usuario_finca')
      .eq('id_usuario', idUsuario)
      .eq('id_finca', idFinca)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error al verificar relación usuario-finca:', checkError);
      throw checkError;
    }
    
    // Si ya existe, actualizar el rol
    if (existingRelation) {
      const { data, error } = await supabase
        .from('usuario_finca')
        .update({ rol })
        .eq('id_usuario_finca', existingRelation.id_usuario_finca)
        .select()
        .single();
        
      if (error) {
        console.error('Error al actualizar relación usuario-finca:', error);
        throw error;
      }
      
      return data;
    }
    
    // Si no existe, crear una nueva relación
    const { data, error } = await supabase
      .from('usuario_finca')
      .insert({
        id_usuario: idUsuario,
        id_finca: idFinca,
        rol
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error al crear relación usuario-finca:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error en asociarUsuarioFinca:', error);
    throw error;
  }
};

/**
 * Elimina la asociación entre un usuario y una finca
 * @param {number} idUsuario - ID del usuario
 * @param {number} idFinca - ID de la finca
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const desasociarUsuarioFinca = async (idUsuario, idFinca) => {
  try {
    const { error } = await supabase
      .from('usuario_finca')
      .delete()
      .eq('id_usuario', idUsuario)
      .eq('id_finca', idFinca);
      
    if (error) {
      console.error('Error al eliminar relación usuario-finca:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error en desasociarUsuarioFinca:', error);
    throw error;
  }
};

/**
 * Obtiene todas las fincas asociadas a un usuario
 * @param {number} idUsuario - ID del usuario
 * @returns {Promise<Array>} - Lista de fincas con su rol
 */
const getFincasByUsuario = async (idUsuario) => {
  try {
    const { data, error } = await supabase
      .from('usuario_finca')
      .select(`
        rol,
        finca:finca(*)
      `)
      .eq('id_usuario', idUsuario);
      
    if (error) {
      console.error('Error al obtener fincas del usuario:', error);
      throw error;
    }
    
    // Formatear los datos para el frontend
    return data.map(item => ({
      ...item.finca,
      _id: item.finca.id_finca.toString(),
      name: item.finca.nombre,
      size: item.finca.tamano,
      rol: item.rol
    }));
  } catch (error) {
    console.error('Error en getFincasByUsuario:', error);
    throw error;
  }
};

/**
 * Obtiene todos los usuarios asociados a una finca
 * @param {number} idFinca - ID de la finca
 * @returns {Promise<Array>} - Lista de usuarios con su rol
 */
const getUsuariosByFinca = async (idFinca) => {
  try {
    const { data, error } = await supabase
      .from('usuario_finca')
      .select(`
        rol,
        usuario:usuario(
          id_usuario,
          primer_nombre,
          segundo_nombre,
          primer_apellido,
          segundo_apellido,
          id_autentificar,
          rol:rol(*)
        )
      `)
      .eq('id_finca', idFinca);
      
    if (error) {
      console.error('Error al obtener usuarios de la finca:', error);
      throw error;
    }
    
    // Formatear los datos para el frontend
    return data.map(item => ({
      ...item.usuario,
      nombre_completo: `${item.usuario.primer_nombre} ${item.usuario.primer_apellido}`,
      rol_finca: item.rol
    }));
  } catch (error) {
    console.error('Error en getUsuariosByFinca:', error);
    throw error;
  }
};

/**
 * Obtiene usuarios por finca y rol
 * @param {number} idFinca - ID de la finca
 * @param {string} rol - Rol a filtrar (propietario, trabajador, veterinario)
 * @returns {Promise<Array>} - Lista de usuarios con el rol especificado
 */
const getUsuariosByFincaAndRol = async (idFinca, rol) => {
  try {
    const { data, error } = await supabase
      .from('usuario_finca')
      .select(`
        usuario:usuario(
          id_usuario,
          primer_nombre,
          segundo_nombre,
          primer_apellido,
          segundo_apellido,
          id_autentificar,
          rol:rol(*)
        )
      `)
      .eq('id_finca', idFinca)
      .eq('rol', rol);
      
    if (error) {
      console.error(`Error al obtener usuarios con rol ${rol} de la finca:`, error);
      throw error;
    }
    
    // Formatear los datos para el frontend
    return data.map(item => ({
      ...item.usuario,
      nombre_completo: `${item.usuario.primer_nombre} ${item.usuario.primer_apellido}`,
      rol_finca: rol
    }));
  } catch (error) {
    console.error('Error en getUsuariosByFincaAndRol:', error);
    throw error;
  }
};

module.exports = {
  asociarUsuarioFinca,
  desasociarUsuarioFinca,
  getFincasByUsuario,
  getUsuariosByFinca,
  getUsuariosByFincaAndRol
}; 