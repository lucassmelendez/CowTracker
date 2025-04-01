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

const CATTLE_COLLECTION = 'cattle';
const FARMS_COLLECTION = 'farms';
const MEDICAL_RECORDS_COLLECTION = 'medicalRecords';
const USERS_COLLECTION = 'users';
const FARM_WORKERS_COLLECTION = 'farm_workers';
const FARM_VETERINARIANS_COLLECTION = 'farm_veterinarians';
const FARM_CATTLE_COLLECTION = 'farm_cattle';


export const getAllCattle = async (userId = null, farmId = null, includeNoFarm = false) => {
  try {
    let cattleQuery;
    
    if (userId && farmId) {
      // Filtrar por usuario y granja específica
      cattleQuery = query(
        collection(firestore, CATTLE_COLLECTION), 
        where('userId', '==', userId),
        where('farmId', '==', farmId)
      );
    } else if (userId && includeNoFarm) {
      // Filtrar por usuario y ganado sin granja asignada
      cattleQuery = query(
        collection(firestore, CATTLE_COLLECTION), 
        where('userId', '==', userId),
        where('farmId', '==', null)
      );
    } else if (userId) {
      // Filtrar solo por usuario
      cattleQuery = query(
        collection(firestore, CATTLE_COLLECTION), 
        where('userId', '==', userId)
      );
    } else {
      // Sin filtros
      cattleQuery = collection(firestore, CATTLE_COLLECTION);
    }
    
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

export const deleteCattle = async (cattleId) => {
  console.log('ID del ganado a eliminar:', cattleId);
  try {
    const docRef = doc(firestore, 'cattle', cattleId);
    await deleteDoc(docRef);
    console.log(`Ganado con ID ${cattleId} eliminado correctamente`);
  } catch (error) {
    console.error('Error al eliminar el ganado:', error);
    throw error;
  }
};

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

export const getAllFarms = async (userId = null) => {
  try {
    let farmsQuery;
    
    if (userId) {
      farmsQuery = query(collection(firestore, FARMS_COLLECTION), where('userId', '==', userId));
    } else {
      farmsQuery = collection(firestore, FARMS_COLLECTION);
    }
    
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

export const deleteFarm = async (farmId) => {
  console.log('ID de la granja a eliminar:', farmId);
  try {
    const docRef = doc(firestore, 'farms', farmId); // Asegúrate de que 'farms' sea el nombre correcto de la colección
    await deleteDoc(docRef);
    console.log(`Granja con ID ${farmId} eliminada correctamente`);
  } catch (error) {
    console.error('Error al eliminar la granja:', error);
    throw error;
  }
};

export const getFarmCattle = async (farmId) => {
  try {
    const cattleQuery = query(
      collection(firestore, CATTLE_COLLECTION),
      where('farmId', '==', farmId)
    );
    
    const querySnapshot = await getDocs(cattleQuery);
    
    return querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al obtener ganado de la granja:', error);
    throw error;
  }
};

export const addWorkerToFarm = async (farmId, workerId) => {
  try {
    const dataWithTimestamp = {
      farmId,
      workerId,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(firestore, FARM_WORKERS_COLLECTION), dataWithTimestamp);
    
    return { success: true, message: 'Trabajador añadido a la granja correctamente' };
  } catch (error) {
    console.error('Error al añadir trabajador a la granja:', error);
    throw error;
  }
};

export const removeWorkerFromFarm = async (farmId, workerId) => {
  try {
    const workerQuery = query(
      collection(firestore, FARM_WORKERS_COLLECTION),
      where('farmId', '==', farmId),
      where('workerId', '==', workerId)
    );
    
    const querySnapshot = await getDocs(workerQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Relación entre trabajador y granja no encontrada');
    }
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return { success: true, message: 'Trabajador eliminado de la granja correctamente' };
  } catch (error) {
    console.error('Error al eliminar trabajador de la granja:', error);
    throw error;
  }
};

export const getFarmWorkers = async (farmId) => {
  try {
    const workerQuery = query(
      collection(firestore, FARM_WORKERS_COLLECTION),
      where('farmId', '==', farmId)
    );
    
    const querySnapshot = await getDocs(workerQuery);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const workerIds = querySnapshot.docs.map(doc => doc.data().workerId);
    
    const workerData = await Promise.all(
      workerIds.map(async (id) => {
        const workerDoc = await getDoc(doc(firestore, USERS_COLLECTION, id));
        if (workerDoc.exists()) {
          return {
            _id: workerDoc.id,
            ...workerDoc.data(),
          };
        }
        return null;
      })
    );
    
    return workerData.filter(worker => worker !== null);
  } catch (error) {
    console.error('Error al obtener trabajadores de la granja:', error);
    throw error;
  }
};

export const addVeterinarianToFarm = async (farmId, vetId) => {
  try {
    const dataWithTimestamp = {
      farmId,
      vetId,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(firestore, FARM_VETERINARIANS_COLLECTION), dataWithTimestamp);
    
    return { success: true, message: 'Veterinario añadido a la granja correctamente' };
  } catch (error) {
    console.error('Error al añadir veterinario a la granja:', error);
    throw error;
  }
};

export const removeVeterinarianFromFarm = async (farmId, vetId) => {
  try {
    const vetQuery = query(
      collection(firestore, FARM_VETERINARIANS_COLLECTION),
      where('farmId', '==', farmId),
      where('vetId', '==', vetId)
    );
    
    const querySnapshot = await getDocs(vetQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Relación entre veterinario y granja no encontrada');
    }
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return { success: true, message: 'Veterinario eliminado de la granja correctamente' };
  } catch (error) {
    console.error('Error al eliminar veterinario de la granja:', error);
    throw error;
  }
};

export const getFarmVeterinarians = async (farmId) => {
  try {
    const vetQuery = query(
      collection(firestore, FARM_VETERINARIANS_COLLECTION),
      where('farmId', '==', farmId)
    );
    
    const querySnapshot = await getDocs(vetQuery);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const vetIds = querySnapshot.docs.map(doc => doc.data().vetId);
    
    const vetData = await Promise.all(
      vetIds.map(async (id) => {
        const vetDoc = await getDoc(doc(firestore, USERS_COLLECTION, id));
        if (vetDoc.exists()) {
          return {
            _id: vetDoc.id,
            ...vetDoc.data(),
          };
        }
        return null;
      })
    );
    
    return vetData.filter(vet => vet !== null);
  } catch (error) {
    console.error('Error al obtener veterinarios de la granja:', error);
    throw error;
  }
};