const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Crea un nuevo usuario en Supabase
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} - Usuario creado
 */
const createUser = async (userData) => {
  try {
    // Normalizar el email a minúsculas
    const normalizedEmail = userData.email.toLowerCase();
    
    // Determinar el nombre completo
    let displayName = userData.name;
    let primerNombre = userData.primer_nombre;
    let segundoNombre = userData.segundo_nombre || '';
    let primerApellido = userData.primer_apellido;
    let segundoApellido = userData.segundo_apellido || '';
    
    // Si existen los campos de nombre individuales pero no el nombre completo
    if (!displayName && (primerNombre || primerApellido)) {
      displayName = [primerNombre, segundoNombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(' ');
    } 
    // Si existe solo el nombre completo, extraer los componentes
    else if (displayName && (!primerNombre && !primerApellido)) {
      const nombreCompleto = displayName.split(' ');
      primerNombre = nombreCompleto[0] || '';
      segundoNombre = nombreCompleto.length > 2 ? nombreCompleto[1] : '';
      primerApellido = nombreCompleto.length > 1 ? 
        (nombreCompleto.length > 2 ? nombreCompleto[2] : nombreCompleto[1]) : '';
      segundoApellido = nombreCompleto.length > 3 ? nombreCompleto[3] : '';
    }
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: userData.password,
      options: {
        data: {
          full_name: displayName,
          role: userData.role || 'user'
        }
      }
    });
    
    if (authError) {
      console.error('Error al crear usuario en Supabase Auth:', authError);
      throw authError;
    }
    
    // Extraer el UUID generado
    const uid = authData.user.id;
    
    // Verificar si el usuario ya existe en la tabla usuario
    const { data: existingUser, error: checkError } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('id_autentificar', uid)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error al verificar usuario existente:', checkError);
      throw checkError;
    }
    
    if (existingUser) {
      console.log('Usuario ya existe en la tabla usuario, saltando inserción');
      return {
        uid,
        email: normalizedEmail,
        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        role: userData.role || 'user'
      };
    }
    
    // Primero verificar que la tabla autentificar tenga este usuario
    const { data: authCheck, error: authCheckError } = await supabase
      .from('autentificar')
      .select('id_autentificar')
      .eq('id_autentificar', uid)
      .maybeSingle();
    
    if (authCheckError) {
      console.error('Error al verificar autentificar:', authCheckError);
    }
    
    if (!authCheck) {
      // Insertar en autentificar si no existe
      const { error: authInsertError } = await supabase
        .from('autentificar')
        .insert({
          id_autentificar: uid,
          correo: normalizedEmail,
          contrasena: '' // No guardamos la contraseña real
        });
      
      if (authInsertError) {
        console.error('Error al insertar en autentificar:', authInsertError);
        throw authInsertError;
      }
    }
    
    // Determinar el id_rol basado en el role
    let id_rol = 2; // Por defecto 'user'
    if (userData.role === 'admin') id_rol = 1;
    else if (userData.role === 'veterinario') id_rol = 3;
    
    // Guardar información adicional en la tabla usuario
    const { data: profileData, error: profileError } = await supabase
      .from('usuario')
      .insert({
        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        id_rol: id_rol,
        id_autentificar: uid
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Error al guardar datos adicionales del usuario:', profileError);
      console.error('Datos que intentamos insertar:', {
        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        id_rol: id_rol,
        id_autentificar: uid,
        id_autentificar_tipo: typeof uid
      });
      
      // Si hay error al guardar el perfil, intentamos eliminar el usuario de Auth
      try {
        await supabase.auth.admin.deleteUser(uid);
      } catch (deleteError) {
        console.error('Error al intentar eliminar usuario después de fallo:', deleteError);
      }
      
      throw profileError;
    }
    
    return {
      uid,
      email: normalizedEmail,
      ...profileData
    };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID
 * @param {string} uid - ID del usuario
 * @returns {Promise<Object|null>} - Usuario o null si no existe
 */
const getUserById = async (uid) => {
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select(`
        *,
        rol:rol(*)
      `)
      .eq('id_autentificar', uid)
      .single();
    
    if (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario autenticado
 */
const signInWithEmail = async (email, password) => {
  try {
    const normalizedEmail = email.toLowerCase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password
    });
    
    if (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
    
    // Obtener datos adicionales del usuario
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select(`
        *,
        rol:rol(*)
      `)
      .eq('id_autentificar', data.user.id)
      .single();
    
    if (userError) {
      console.error('Error al obtener datos del usuario:', userError);
      throw userError;
    }
    
    // Convertir el rol a formato compatible con la app existente
    let role = 'user';
    if (userData.rol && userData.rol.id) {
      if (userData.rol.id === 1) role = 'admin';
      else if (userData.rol.id === 3) role = 'veterinario';
    }
    
    return {
      uid: data.user.id,
      email: data.user.email,
      token: data.session.access_token,
      role,
      name: `${userData.primer_nombre} ${userData.primer_apellido}`,
      primer_nombre: userData.primer_nombre,
      segundo_nombre: userData.segundo_nombre,
      primer_apellido: userData.primer_apellido,
      segundo_apellido: userData.segundo_apellido,
      id_usuario: userData.id_usuario
    };
  } catch (error) {
    console.error('Error en servicio de login:', error);
    throw error;
  }
};

/**
 * Actualiza un usuario
 * @param {string} uid - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} - Usuario actualizado
 */
const updateUser = async (uid, userData) => {
  try {
    // Buscar el usuario por id_autentificar
    const { data: userFind, error: findError } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('id_autentificar', uid)
      .single();
    
    if (findError) {
      throw findError;
    }
    
    const userId = userFind.id_usuario;
    
    const updateData = { ...userData };
    
    // Si se actualiza la contraseña
    if (userData.password) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        uid,
        { password: userData.password }
      );
      
      if (authError) {
        throw authError;
      }
      
      // No incluir password en los datos a actualizar en la tabla usuario
      delete updateData.password;
    }
    
    // Si se actualiza el email
    if (userData.email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(
        uid,
        { email: userData.email }
      );
      
      if (emailError) {
        throw emailError;
      }
      
      // El email no se guarda en la tabla usuario, así que lo eliminamos
      delete updateData.email;
    }
    
    // Si se actualiza el rol
    if (userData.role) {
      let id_rol = 2; // Por defecto user
      if (userData.role === 'admin') id_rol = 1;
      else if (userData.role === 'veterinario') id_rol = 3;
      
      updateData.id_rol = id_rol;
      delete updateData.role;
    }
    
    // Eliminar campos que no pertenecen a la tabla usuario
    delete updateData.created_at;
    delete updateData.updated_at;
    
    // Actualizar datos en la tabla usuario
    const { data, error } = await supabase
      .from('usuario')
      .update(updateData)
      .eq('id_usuario', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      uid,
      ...data,
      email: userData.email // Devolver el email actualizado si se proporcionó
    };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {string} uid - ID del usuario
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteUser = async (uid) => {
  try {
    // Buscar el usuario por id_autentificar
    const { data: userFind, error: findError } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('id_autentificar', uid)
      .single();
    
    if (findError) {
      throw findError;
    }
    
    const userId = userFind.id_usuario;
    
    // Eliminar de la tabla usuario
    const { error: profileError } = await supabase
      .from('usuario')
      .delete()
      .eq('id_usuario', userId);
    
    if (profileError) {
      throw profileError;
    }
    
    // Eliminar de auth
    const { error: authError } = await supabase.auth.admin.deleteUser(uid);
    
    if (authError) {
      throw authError;
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} - Lista de usuarios
 */
const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select(`
        *,
        rol:rol(*),
        autentificar:autentificar(*)
      `);
    
    if (error) {
      throw error;
    }
    
    // Formatear para compatibilidad con la app
    return data.map(user => {
      let role = 'user';
      if (user.rol && user.rol.id_rol) {
        if (user.rol.id_rol === 1) role = 'admin';
        else if (user.rol.id_rol === 3) role = 'veterinario';
      }
      
      return {
        uid: user.id_autentificar,
        id_usuario: user.id_usuario,
        email: user.autentificar ? user.autentificar.correo : '',
        role,
        name: `${user.primer_nombre} ${user.primer_apellido}`,
        primer_nombre: user.primer_nombre,
        segundo_nombre: user.segundo_nombre,
        primer_apellido: user.primer_apellido,
        segundo_apellido: user.segundo_apellido
      };
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Cambia el rol de un usuario
 * @param {string} uid - ID del usuario
 * @param {string} role - Nuevo rol
 * @returns {Promise<Object>} - Usuario actualizado
 */
const changeUserRole = async (uid, role) => {
  try {
    // Mapear el rol a id_rol
    let id_rol = 2; // Por defecto user
    if (role === 'admin') id_rol = 1;
    else if (role === 'veterinario') id_rol = 3;
    
    // Buscar el usuario por id_autentificar
    const { data: userFind, error: findError } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('id_autentificar', uid)
      .single();
    
    if (findError) {
      throw findError;
    }
    
    const userId = userFind.id_usuario;
    
    // Actualizar en la tabla usuario
    const { data, error } = await supabase
      .from('usuario')
      .update({ id_rol })
      .eq('id_usuario', userId)
      .select(`
        *,
        rol:rol(*)
      `)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Actualizar metadata en auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      uid,
      { 
        user_metadata: { role }
      }
    );
    
    if (authError) {
      console.error('Error al actualizar metadatos de autenticación:', authError);
    }
    
    return data;
  } catch (error) {
    console.error('Error al cambiar rol de usuario:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  signInWithEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  changeUserRole
}; 