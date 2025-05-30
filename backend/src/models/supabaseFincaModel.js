const { supabase } = require('../config/supabase');

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
          fincaData.id_usuario = usuario.id_usuario;
        }
      } else {
        // Si ya es un número, usarlo directamente
        fincaData.id_usuario = parseInt(datos.propietario_id);
      }
    }
    
    // Insertar en la tabla finca
    const { data, error } = await supabase
      .from('finca')
      .insert(fincaData)
      .select()
      .single();
    
    if (error) {
      throw error;
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
      .select(`
        *,
        usuario:usuario(id_usuario, primer_nombre, primer_apellido, id_autentificar)
      `)
      .order('id_finca');
    
    if (error) {
      throw error;
    }
    
    // Formatear para compatibilidad con el frontend
    return data.map(finca => ({
      ...finca,
      _id: finca.id_finca.toString(),
      name: finca.nombre,
      size: finca.tamano,
      propietario: finca.usuario ? {
        id: finca.usuario.id_autentificar,
        id_usuario: finca.usuario.id_usuario,
        name: `${finca.usuario.primer_nombre} ${finca.usuario.primer_apellido}`
      } : null
    }));
  } catch (error) {
    console.error('Error al obtener fincas:', error);
    throw error;
  }
};

/**
 * Obtiene las fincas por propietario
 * @param {number} userId - ID del propietario
 * @returns {Promise<Array>} - Lista de fincas del propietario
 */
const getFincasByOwner = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('finca')
      .select('*')
      .eq('id_usuario', userId)
      .order('id_finca');
    
    if (error) {
      throw error;
    }
    
    return data.map(finca => ({
      ...finca,
      _id: finca.id_finca.toString(),
      name: finca.nombre,
      size: finca.tamano,
      area: finca.tamano // Para mantener compatibilidad
    }));
  } catch (error) {
    console.error('Error al obtener fincas por propietario:', error);
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
 * Obtiene los trabajadores de una finca
 * @param {number} fincaId - ID de la finca
 * @returns {Promise<Array>} - Lista de trabajadores de la finca
 */
const getFincaTrabajadores = async (fincaId) => {
  try {
    // Esta funcionalidad puede que no exista en el esquema actual
    // Basándonos en la imagen, no vemos una relación directa entre fincas y trabajadores
    console.warn('La relación entre fincas y trabajadores no está claramente definida en el esquema');
    
    // Como alternativa, podríamos devolver todos los usuarios excepto el propietario de la finca
    const { data: finca } = await supabase
      .from('finca')
      .select('id_usuario')
      .eq('id_finca', fincaId)
      .single();
    
    if (!finca) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('usuario')
      .select(`
        *,
        rol:rol(*)
      `)
      .neq('id_usuario', finca.id_usuario)
      .eq('id_rol', 2); // Asumiendo que el rol 2 es para trabajadores regulares
    
    if (error) {
      throw error;
    }
    
    return data.map(usuario => ({
      id: usuario.id_autentificar,
      id_usuario: usuario.id_usuario,
      name: `${usuario.primer_nombre} ${usuario.primer_apellido}`,
      role: 'user',
      fecha_asociacion: new Date().toISOString() // No tenemos esta información en el esquema
    }));
  } catch (error) {
    console.error('Error al obtener trabajadores de la finca:', error);
    throw error;
  }
};

/**
 * Obtiene los veterinarios de una finca
 * @param {number} fincaId - ID de la finca
 * @returns {Promise<Array>} - Lista de veterinarios de la finca
 */
const getFincaVeterinarios = async (fincaId) => {
  try {
    // Esta funcionalidad puede que no exista en el esquema actual
    // Basándonos en la imagen, no vemos una relación directa entre fincas y veterinarios
    console.warn('La relación entre fincas y veterinarios no está claramente definida en el esquema');
    
    // Como alternativa, podríamos devolver todos los usuarios con rol de veterinario
    const { data, error } = await supabase
      .from('usuario')
      .select(`
        *,
        rol:rol(*)
      `)
      .eq('id_rol', 3); // Asumiendo que el rol 3 es para veterinarios
    
    if (error) {
      throw error;
    }
    
    return data.map(usuario => ({
      id: usuario.id,
      name: `${usuario.primer_nombre} ${usuario.primer_apellido}`,
      email: usuario.email,
      role: 'veterinario',
      fecha_asociacion: new Date().toISOString() // No tenemos esta información en el esquema
    }));
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