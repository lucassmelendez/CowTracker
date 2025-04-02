import api from './api';

// Servicios de ganado
export const getAllCattle = async (userId = null, farmId = null, includeNoFarm = false) => {
  try {
    let url = '/cattle';
    const params = {};
    
    if (farmId) params.farmId = farmId;
    if (includeNoFarm) params.includeNoFarm = true;
    
    const response = await api.get(url, { params });
    return response;
  } catch (error) {
    console.error('Error al obtener ganado:', error);
    throw error;
  }
};

export const getCattleById = async (id) => {
  try {
    const response = await api.cattle.getById(id);
    return response;
  } catch (error) {
    console.error('Error al obtener ganado por ID:', error);
    throw error;
  }
};

export const createCattle = async (cattleData) => {
  try {
    const response = await api.cattle.create(cattleData);
    return response;
  } catch (error) {
    console.error('Error al crear ganado:', error);
    throw error;
  }
};

export const updateCattle = async (id, cattleData) => {
  try {
    const response = await api.cattle.update(id, cattleData);
    return response;
  } catch (error) {
    console.error('Error al actualizar ganado:', error);
    throw error;
  }
};

export const deleteCattle = async (id) => {
  try {
    const response = await api.cattle.delete(id);
    return response;
  } catch (error) {
    console.error('Error al eliminar ganado:', error);
    throw error;
  }
};

export const getMedicalRecords = async (cattleId) => {
  try {
    const response = await api.cattle.getMedicalRecords(cattleId);
    return response;
  } catch (error) {
    console.error('Error al obtener registros médicos:', error);
    throw error;
  }
};

export const addMedicalRecord = async (cattleId, medicalData) => {
  try {
    const response = await api.cattle.addMedicalRecord(cattleId, medicalData);
    return response;
  } catch (error) {
    console.error('Error al agregar registro médico:', error);
    throw error;
  }
};

// Servicios de usuarios
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/users/role/${role}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener usuarios con rol ${role}:`, error);
    throw error;
  }
};

// Servicios de granjas
export const getAllFarms = async (userId = null) => {
  try {
    const response = await api.farms.getAll();
    return response;
  } catch (error) {
    console.error('Error al obtener granjas:', error);
    throw error;
  }
};

export const getFarmById = async (id) => {
  try {
    const response = await api.farms.getById(id);
    return response;
  } catch (error) {
    console.error('Error al obtener granja por ID:', error);
    throw error;
  }
};

export const createFarm = async (farmData) => {
  try {
    const response = await api.farms.create(farmData);
    return response;
  } catch (error) {
    console.error('Error al crear granja:', error);
    throw error;
  }
};

export const updateFarm = async (id, farmData) => {
  try {
    const response = await api.farms.update(id, farmData);
    return response;
  } catch (error) {
    console.error('Error al actualizar granja:', error);
    throw error;
  }
};

export const deleteFarm = async (id) => {
  try {
    const response = await api.farms.delete(id);
    return response;
  } catch (error) {
    console.error('Error al eliminar granja:', error);
    throw error;
  }
};

// Trabajadores de granja
export const getFarmWorkers = async (farmId) => {
  try {
    const response = await api.get(`/farms/${farmId}/workers`);
    return response;
  } catch (error) {
    console.error('Error al obtener trabajadores de la granja:', error);
    throw error;
  }
};

export const addWorkerToFarm = async (farmId, workerId) => {
  try {
    const response = await api.post(`/farms/${farmId}/workers`, { workerId });
    return response;
  } catch (error) {
    console.error('Error al añadir trabajador a la granja:', error);
    throw error;
  }
};

export const removeWorkerFromFarm = async (farmId, workerId) => {
  try {
    const response = await api.delete(`/farms/${farmId}/workers/${workerId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar trabajador de la granja:', error);
    throw error;
  }
};

// Veterinarios de granja
export const getFarmVeterinarians = async (farmId) => {
  try {
    const response = await api.get(`/farms/${farmId}/veterinarians`);
    return response;
  } catch (error) {
    console.error('Error al obtener veterinarios de la granja:', error);
    throw error;
  }
};

export const addVeterinarianToFarm = async (farmId, veterinarianId) => {
  try {
    const response = await api.post(`/farms/${farmId}/veterinarians`, { veterinarianId });
    return response;
  } catch (error) {
    console.error('Error al añadir veterinario a la granja:', error);
    throw error;
  }
};

export const removeVeterinarianFromFarm = async (farmId, veterinarianId) => {
  try {
    const response = await api.delete(`/farms/${farmId}/veterinarians/${veterinarianId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar veterinario de la granja:', error);
    throw error;
  }
};

// Ganado de granja
export const getFarmCattle = async (farmId) => {
  try {
    const response = await api.get(`/farms/${farmId}/cattle`);
    return response;
  } catch (error) {
    console.error('Error al obtener ganado de la granja:', error);
    throw error;
  }
}; 