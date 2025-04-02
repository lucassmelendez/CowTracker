const { auth, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const usersCollection = db.collection('users');

/**
 * Registrar un usuario con email y contraseña
 */
const registerWithEmailAndPassword = async (userData) => {
  const { name, email, password, role = 'user' } = userData;
  
  try {
    // Verificar si el usuario ya existe
    const userExists = await auth.getUserByEmail(email).catch(() => null);
    
    if (userExists) {
      throw new Error('Este correo electrónico ya está registrado');
    }
    
    // Hash de la contraseña para almacenarla de forma segura
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear el usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      disabled: false
    });
    
    // Asignar rol personalizado
    await auth.setCustomUserClaims(userRecord.uid, { role });
    
    // Guardar información adicional en Firestore
    const userData = {
      uid: userRecord.uid,
      email,
      name,
      role,
      passwordHash: hashedPassword, // Para validación posterior en el backend
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await usersCollection.doc(userRecord.uid).set(userData);
    
    // Generar token JWT
    const token = generateToken(userRecord.uid, role);
    
    return {
      uid: userRecord.uid,
      email,
      name,
      role,
      token
    };
  } catch (error) {
    throw new Error(`Error al registrar usuario: ${error.message}`);
  }
};

/**
 * Iniciar sesión con email y contraseña 
 */
const loginWithEmailAndPassword = async (email, password) => {
  try {
    // Buscar usuario por email
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    
    if (!userRecord) {
      throw new Error('Credenciales inválidas');
    }
    
    // Obtener información adicional del usuario desde Firestore
    const userDoc = await usersCollection.doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = userDoc.data();
    
    // Verificar contraseña
    // En producción, esta verificación debería hacerse en un contexto seguro
    const isMatch = await bcrypt.compare(password, userData.passwordHash || '');
    
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }
    
    // Obtener los claims del usuario
    const { customClaims } = await auth.getUser(userRecord.uid);
    const role = customClaims?.role || 'user';
    
    // Generar token JWT
    const token = generateToken(userRecord.uid, role);
    
    return {
      uid: userRecord.uid,
      email: userData.email,
      name: userData.name,
      role,
      token
    };
  } catch (error) {
    throw new Error(`Error al iniciar sesión: ${error.message}`);
  }
};

/**
 * Verificar token de autenticación
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cowtracker-secret-key');
    const userRecord = await auth.getUser(decoded.uid);
    
    if (!userRecord) {
      throw new Error('Usuario no encontrado');
    }
    
    const { customClaims } = userRecord;
    const role = customClaims?.role || decoded.role || 'user';
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
      role
    };
  } catch (error) {
    throw new Error(`Error al verificar token: ${error.message}`);
  }
};

/**
 * Actualizar perfil de usuario
 */
const updateUserProfile = async (uid, userData) => {
  try {
    const { name, email } = userData;
    const updateData = {};
    
    // Actualizar en Firebase Auth
    const authUpdateData = {};
    
    if (name) {
      authUpdateData.displayName = name;
      updateData.name = name;
    }
    
    if (email) {
      authUpdateData.email = email;
      updateData.email = email;
    }
    
    if (Object.keys(authUpdateData).length > 0) {
      await auth.updateUser(uid, authUpdateData);
    }
    
    // Actualizar en Firestore
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date().toISOString();
      await usersCollection.doc(uid).update(updateData);
    }
    
    // Obtener usuario actualizado
    const userDoc = await usersCollection.doc(uid).get();
    const user = userDoc.data();
    
    return {
      uid,
      ...user
    };
  } catch (error) {
    throw new Error(`Error al actualizar perfil: ${error.message}`);
  }
};

/**
 * Generar JWT token
 */
const generateToken = (uid, role) => {
  return jwt.sign(
    { uid, role },
    process.env.JWT_SECRET || 'cowtracker-secret-key',
    { expiresIn: '30d' }
  );
};

module.exports = {
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  verifyToken,
  updateUserProfile
};
