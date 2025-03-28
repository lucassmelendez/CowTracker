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
  serverTimestamp
} from 'firebase/firestore';

// Colecciones de Firestore
const CATTLE_COLLECTION = 'cattle';
const FARMS_COLLECTION = 'farms';
const MEDICAL_RECORDS_COLLECTION = 'medicalRecords';

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