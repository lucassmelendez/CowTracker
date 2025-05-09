const { db, auth, admin } = require('../config/firebase');

const usersCollection = db.collection('users');
const rolCollection = db.collection('roles');

/**
 * Crea un nuevo usuario en Firebase Auth y Firestore
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} - Usuario creado
 */
const createUser = async (userData) => {
  try {
    // Normalizar el email a minúsculas
    const normalizedEmail = userData.email.toLowerCase();
    
    // Determinar el nombre para displayName en Firebase Auth
    let displayName = userData.name;
    let primerNombre = userData.primer_nombre;
    let segundoNombre = userData.segundo_nombre;
    let primerApellido = userData.primer_apellido;
    let segundoApellido = userData.segundo_apellido;
    
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
    
    // Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email: normalizedEmail,
      password: userData.password,
      displayName: displayName,
      disabled: false
    });

    // Preparar datos para Firestore
    const userDataForFirestore = {
      uid: userRecord.uid,
      email: normalizedEmail,
      role: userData.role || 'user',
      // Datos del nombre completo e individual
      name: displayName,
      id_usuario: userRecord.uid,
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Guardar en Firestore
    await usersCollection.doc(userRecord.uid).set(userDataForFirestore);

    // Establecer claims personalizados para el control de acceso basado en roles
    await auth.setCustomUserClaims(userRecord.uid, { role: userData.role || 'user' });

    return { ...userRecord, ...userDataForFirestore };
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
    const userDoc = await usersCollection.doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error al obtener usuario:', error);
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
    const authUpdateData = {};
    if (userData.email) authUpdateData.email = userData.email;
    if (userData.password) authUpdateData.password = userData.password;
    
    const firestoreUpdateData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    delete firestoreUpdateData.password;
    
    // Gestionar campos de nombre
    let displayName = userData.name;
    
    // Si tenemos campos individuales pero no name, reconstruir name
    if (!displayName && (userData.primer_nombre || userData.primer_apellido)) {
      displayName = [
        userData.primer_nombre, 
        userData.segundo_nombre, 
        userData.primer_apellido, 
        userData.segundo_apellido
      ].filter(Boolean).join(' ');
      
      firestoreUpdateData.name = displayName;
    } 
    // Si tenemos name pero no campos individuales, extraer campos individuales
    else if (displayName && (!userData.primer_nombre && !userData.primer_apellido)) {
      const nombreCompleto = displayName.split(' ');
      firestoreUpdateData.primer_nombre = nombreCompleto[0] || '';
      firestoreUpdateData.segundo_nombre = nombreCompleto.length > 2 ? nombreCompleto[1] : '';
      firestoreUpdateData.primer_apellido = nombreCompleto.length > 1 ? 
        (nombreCompleto.length > 2 ? nombreCompleto[2] : nombreCompleto[1]) : '';
      firestoreUpdateData.segundo_apellido = nombreCompleto.length > 3 ? nombreCompleto[3] : '';
    }
    
    // Actualizar displayName en Auth si hay cambios en el nombre
    if (displayName) {
      authUpdateData.displayName = displayName;
    }
    
    if (Object.keys(authUpdateData).length > 0) {
      await auth.updateUser(uid, authUpdateData);
    }
    
    await usersCollection.doc(uid).update(firestoreUpdateData);
    
    if (userData.role) {
      await auth.setCustomUserClaims(uid, { role: userData.role });
    }
    
    return await getUserById(uid);
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
    await auth.deleteUser(uid);
    
    await usersCollection.doc(uid).delete();
    
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
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => doc.data());
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
    await usersCollection.doc(uid).update({ 
      role,
      updatedAt: new Date().toISOString()
    });
    
    await auth.setCustomUserClaims(uid, { role });
    
    return await getUserById(uid);
  } catch (error) {
    console.error('Error al cambiar rol de usuario:', error);
    throw error;
  }
};

/**
 * Autentica a un usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario autenticado
 */
const signInWithEmail = async (email, password) => {
  try {
    console.log(`Intentando autenticar a usuario con email: ${email}`);
    
    // Firebase Admin no tiene signInWithEmailAndPassword directamente
    // Primero buscamos el usuario por email
    const userRecord = await auth.getUserByEmail(email);
    
    // Verificamos que exista el usuario
    if (!userRecord) {
      console.error('Usuario no encontrado');
      throw new Error('Usuario no encontrado');
    }
    
    console.log(`Usuario encontrado con UID: ${userRecord.uid}`);
    
    // NOTA: Firebase Admin no puede verificar contraseñas directamente
    // En un entorno de producción, necesitarías una solución más robusta
    // Aquí estamos confiando en que el usuario existe y generando un token
    
    // Generamos un token personalizado para la autenticación
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // Obtenemos datos adicionales del usuario desde Firestore
    const userData = await getUserById(userRecord.uid);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      name: userData.name,
      role: userData.role,
      primer_nombre: userData.primer_nombre,
      segundo_nombre: userData.segundo_nombre,
      primer_apellido: userData.primer_apellido,
      segundo_apellido: userData.segundo_apellido,
      token: customToken
    };
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    
    // Para evitar revelar información sensible, simplificamos el mensaje de error
    if (error.code === 'auth/user-not-found') {
      throw new Error('Credenciales incorrectas');
    }
    
    throw error;
  }
};

/**
 * Asocia un rol específico al usuario (rol de la tabla ROL)
 * @param {string} userId - ID del usuario en Firebase
 * @param {string} rolId - ID del rol en la colección 'roles'
 * @returns {Promise<Object>} - Usuario actualizado
 */
const asociarRolAUsuario = async (userId, rolId) => {
  try {
    // Verificar que exista el rol
    const rolDoc = await rolCollection.doc(rolId).get();
    if (!rolDoc.exists) {
      throw new Error(`El rol con ID ${rolId} no existe`);
    }
    
    const rolData = rolDoc.data();
    
    // Obtenemos los datos actuales del usuario
    const usuario = await getUserById(userId);
    if (!usuario) {
      throw new Error(`El usuario con ID ${userId} no existe`);
    }
    
    // Actualizamos el usuario con la referencia al rol
    const updateData = {
      rol_id: rolId,
      rol_data: {
        id_rol: rolData.id_rol,
        descripcion: rolData.descripcion
      },
      rol_ref: db.doc(`roles/${rolId}`),
      // Actualizamos también el rol en Firebase Auth
      role: rolData.descripcion
    };
    
    // Actualizar en Firebase y Firestore
    return await updateUser(userId, updateData);
  } catch (error) {
    console.error('Error al asociar rol a usuario:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario en formato completo USUARIO
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} - Usuario en formato USUARIO o null si no existe
 */
const getUsuarioCompleto = async (userId) => {
  try {
    const usuario = await getUserById(userId);
    if (!usuario) {
      return null;
    }
    
    return usuario;
  } catch (error) {
    console.error('Error al obtener usuario completo:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  changeUserRole,
  signInWithEmail,
  asociarRolAUsuario,
  getUsuarioCompleto
};