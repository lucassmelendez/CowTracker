import { firestore } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Colecciones de Firestore
const CATTLE_COLLECTION = 'cattle';
const FARMS_COLLECTION = 'farms';
const MEDICAL_RECORDS_COLLECTION = 'medicalRecords';
const USERS_COLLECTION = 'users';
const FARM_WORKERS_COLLECTION = 'farm_workers';
const FARM_VETERINARIANS_COLLECTION = 'farm_veterinarians';
const FARM_CATTLE_COLLECTION = 'farm_cattle';

// Funciones para el manejo de ganado
export const getAllCattle = async (userId) => {
  try {
    const cattleQuery = query(collection(firestore, CATTLE_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(cattleQuery);
    
    return querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al obtener ganado:', error);
    throw error;
  }
};

export const getCattleById = async (id) => {
  try {
    const docRef = doc(firestore, CATTLE_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        _id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      throw new Error('Ganado no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener detalles del ganado:', error);
    throw error;
  }
};

export const createCattle = async (cattleData) => {
  try {
    const dataWithTimestamp = {
      ...cattleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(firestore, CATTLE_COLLECTION), dataWithTimestamp);
    
    return {
      _id: docRef.id,
      ...cattleData,
    };
  } catch (error) {
    console.error('Error al crear ganado:', error);
    throw error;
  }
};

export const updateCattle = async (id, cattleData) => {
  try {
    const dataWithTimestamp = {
      ...cattleData,
      updatedAt: serverTimestamp(),
    };
    
    const docRef = doc(firestore, CATTLE_COLLECTION, id);
    await updateDoc(docRef, dataWithTimestamp);
    
    return {
      _id: id,
      ...cattleData,
    };
  } catch (error) {
    console.error('Error al actualizar ganado:', error);
    throw error;
  }
};

export const deleteCattle = async (id) => {
  try {
    const docRef = doc(firestore, CATTLE_COLLECTION, id);
    await deleteDoc(docRef);
    
    return { success: true, message: 'Ganado eliminado correctamente' };
  } catch (error) {
    console.error('Error al eliminar ganado:', error);
    throw error;
  }
};

// Funciones para el manejo de registros médicos
export const addMedicalRecord = async (cattleId, medicalData) => {
  try {
    const dataWithTimestamp = {
      ...medicalData,
      cattleId,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(firestore, MEDICAL_RECORDS_COLLECTION), dataWithTimestamp);
    
    return {
      _id: docRef.id,
      ...medicalData,
    };
  } catch (error) {
    console.error('Error al agregar registro médico:', error);
    throw error;
  }
};

export const getMedicalRecords = async (cattleId) => {
  try {
    const medicalQuery = query(
      collection(firestore, MEDICAL_RECORDS_COLLECTION), 
      where('cattleId', '==', cattleId)
    );
    const querySnapshot = await getDocs(medicalQuery);
    
    return querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al obtener registros médicos:', error);
    throw error;
  }
};

// Funciones para el manejo de usuarios
export const getUsersByRole = async (role) => {
  try {
    const usersQuery = query(
      collection(firestore, USERS_COLLECTION),
      where('role', '==', role)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    return querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error al obtener usuarios con rol ${role}:`, error);
    throw error;
  }
};

// Funciones para el manejo de granjas
export const getAllFarms = async (userId) => {
  try {
    const farmsQuery = query(collection(firestore, FARMS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(farmsQuery);
    
    return querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al obtener granjas:', error);
    throw error;
  }
};

export const createFarm = async (farmData) => {
  try {
    const dataWithTimestamp = {
      ...farmData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(firestore, FARMS_COLLECTION), dataWithTimestamp);
    
    return {
      _id: docRef.id,
      ...farmData,
    };
  } catch (error) {
    console.error('Error al crear granja:', error);
    throw error;
  }
};

export const updateFarm = async (id, farmData) => {
  try {
    const dataWithTimestamp = {
      ...farmData,
      updatedAt: serverTimestamp(),
    };
    
    const docRef = doc(firestore, FARMS_COLLECTION, id);
    await updateDoc(docRef, dataWithTimestamp);
    
    return {
      _id: id,
      ...farmData,
    };
  } catch (error) {
    console.error('Error al actualizar granja:', error);
    throw error;
  }
};



// Funciones para gestionar ganado en granjas
export const addCattleToFarm = async (farmId, cattleId) => {
  try {
    // Crear un documento en la colección de relación farm_cattle
    const dataWithTimestamp = {
      farmId,
      cattleId,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(firestore, FARM_CATTLE_COLLECTION), dataWithTimestamp);
    
    // Actualizar el contador de ganado en la granja
    const farmDoc = await getDoc(doc(firestore, FARMS_COLLECTION, farmId));
    if (farmDoc.exists()) {
      const farmData = farmDoc.data();
      const cattleCount = farmData.cattleCount || 0;
      
      await updateDoc(doc(firestore, FARMS_COLLECTION, farmId), {
        cattleCount: cattleCount + 1,
        updatedAt: serverTimestamp(),
      });
    }
    
    return { success: true, message: 'Ganado añadido a la granja correctamente' };
  } catch (error) {
    console.error('Error al añadir ganado a la granja:', error);
    throw error;
  }
};

export const removeCattleFromFarm = async (farmId, cattleId) => {
  try {
    // Buscar el documento que relaciona la granja con el ganado
    const cattleQuery = query(
      collection(firestore, FARM_CATTLE_COLLECTION),
      where('farmId', '==', farmId),
      where('cattleId', '==', cattleId)
    );
    
    const querySnapshot = await getDocs(cattleQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Relación entre ganado y granja no encontrada');
    }
    
    // Eliminar todos los documentos encontrados (debería ser solo uno)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Actualizar el contador de ganado en la granja
    const farmDoc = await getDoc(doc(firestore, FARMS_COLLECTION, farmId));
    if (farmDoc.exists()) {
      const farmData = farmDoc.data();
      const cattleCount = farmData.cattleCount || 0;
      
      await updateDoc(doc(firestore, FARMS_COLLECTION, farmId), {
        cattleCount: Math.max(0, cattleCount - 1),
        updatedAt: serverTimestamp(),
      });
    }
    
    return { success: true, message: 'Ganado eliminado de la granja correctamente' };
  } catch (error) {
    console.error('Error al eliminar ganado de la granja:', error);
    throw error;
  }
};

export const getFarmCattle = async (farmId) => {
  try {
    // Buscar todas las relaciones para esta granja
    const cattleQuery = query(
      collection(firestore, FARM_CATTLE_COLLECTION),
      where('farmId', '==', farmId)
    );
    
    const querySnapshot = await getDocs(cattleQuery);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    // Obtener los IDs del ganado
    const cattleIds = querySnapshot.docs.map(doc => doc.data().cattleId);
    
    // Obtener los datos de cada ganado
    const cattleData = await Promise.all(
      cattleIds.map(async (id) => {
        const cattleDoc = await getDoc(doc(firestore, CATTLE_COLLECTION, id));
        if (cattleDoc.exists()) {
          return {
            _id: cattleDoc.id,
            ...cattleDoc.data(),
          };
        }
        return null;
      })
    );
    
    // Filtrar posibles nulos
    return cattleData.filter(cattle => cattle !== null);
  } catch (error) {
    console.error('Error al obtener ganado de la granja:', error);
    throw error;
  }
};