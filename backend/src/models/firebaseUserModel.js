const { db, auth } = require('../config/firebase');

const usersCollection = db.collection('users');

const createUser = async (userData) => {
  try {
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
      disabled: false
    });

    const userDataForFirestore = {
      uid: userRecord.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await usersCollection.doc(userRecord.uid).set(userDataForFirestore);

    await auth.setCustomUserClaims(userRecord.uid, { role: userData.role || 'user' });

    return { ...userRecord, ...userDataForFirestore };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

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

const updateUser = async (uid, userData) => {
  try {
    const authUpdateData = {};
    if (userData.email) authUpdateData.email = userData.email;
    if (userData.password) authUpdateData.password = userData.password;
    if (userData.name) authUpdateData.displayName = userData.name;
    
    if (Object.keys(authUpdateData).length > 0) {
      await auth.updateUser(uid, authUpdateData);
    }
    
    const firestoreUpdateData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    delete firestoreUpdateData.password;
    
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

const getAllUsers = async () => {
  try {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

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

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  changeUserRole
};