import api from './api';
import cacheManager, { CacheConfig } from './cacheManager';
import { 
  Farm, 
  CattleItem, 
  UserInfo, 
  MedicalRecord,
  RegisterData,
  LoginCredentials,
  UpdateProfileData,
  ReportData,
  CattleDetail,
  CachedReportData
} from '../types';

// Configuraciones de caché por tipo de datos
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  farms: { ttl: 10 * 60 * 1000 }, // 10 minutos para granjas
  cattle: { ttl: 5 * 60 * 1000 }, // 5 minutos para ganado
  users: { ttl: 15 * 60 * 1000 }, // 15 minutos para usuarios
  medical: { ttl: 30 * 60 * 1000 }, // 30 minutos para registros médicos
  reports: { ttl: 5 * 60 * 1000 }, // 5 minutos para datos de informes
};

class CachedApiService {
  // ==================== FARMS API ====================
  
  async getFarms(): Promise<Farm[]> {
    const cacheKey = 'farms/all';
    
    // Intentar obtener del caché primero
    const cachedData = await cacheManager.get<Farm[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Si no está en caché, hacer petición a la API
    const data = await api.farms.getAll();
    
    // Guardar en caché
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.farms);
    
    return data;
  }

  async getUserFarms(): Promise<Farm[]> {
    const cacheKey = 'farms/user';
    
    const cachedData = await cacheManager.get<Farm[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.farms.getUserFarms();
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.farms);
    
    return data;
  }

  async getFarmById(id: string): Promise<Farm> {
    const cacheKey = 'farms/by-id';
    const params = { id };
    
    const cachedData = await cacheManager.get<Farm>(cacheKey, params);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.farms.getById(id);
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.farms, params);
    
    return data;
  }

  async createFarm(farmData: Partial<Farm>): Promise<Farm> {
    const data = await api.farms.create(farmData);
    
    // Invalidar caché de granjas después de crear
    await cacheManager.invalidate('farms');
    
    return data;
  }

  async updateFarm(id: string, farmData: Partial<Farm>): Promise<Farm> {
    const data = await api.farms.update(id, farmData);
    
    // Invalidar caché de granjas después de actualizar
    await cacheManager.invalidate('farms');
    
    return data;
  }

  async deleteFarm(id: string): Promise<void> {
    await api.farms.delete(id);
    
    // Invalidar caché de granjas después de eliminar
    await cacheManager.invalidate('farms');
  }

  // ==================== CATTLE API ====================

  async getAllCattle(): Promise<CattleItem[]> {
    const cacheKey = 'cattle/all';
    
    const cachedData = await cacheManager.get<CattleItem[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.cattle.getAll();
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.cattle);
    
    return data;
  }

  async getAllCattleWithFarmInfo(): Promise<CattleItem[]> {
    const cacheKey = 'cattle/with-farm-info';
    
    const cachedData = await cacheManager.get<CattleItem[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.cattle.getAllWithFarmInfo();
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.cattle);
    
    return data;
  }

  async getCattleById(id: string | number): Promise<CattleItem> {
    const cacheKey = 'cattle/by-id';
    const params = { id: id.toString() };
    
    const cachedData = await cacheManager.get<CattleItem>(cacheKey, params);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.cattle.getById(id);
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.cattle, params);
    
    return data;
  }

  async getFarmCattle(farmId: string): Promise<CattleItem[]> {
    const cacheKey = 'cattle/by-farm';
    const params = { farmId };
    const cachedData = await cacheManager.get<CattleItem[]>(cacheKey, params);

    if (cachedData) {
      return cachedData;
    }

    const response = await api.farms.getCattle(farmId);
    
    let data: CattleItem[] = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
      data = (response as any).data;
    } else if (response && typeof response === 'object') {
      const possibleArrays = ['data', 'cattle', 'items', 'results'];
      for (const key of possibleArrays) {
        if ((response as any)[key] && Array.isArray((response as any)[key])) {
          data = (response as any)[key];
          break;
        }
      }
    }
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.cattle, params);
    
    return data;
  }

  async createCattle(cattleData: Partial<CattleItem>): Promise<CattleItem> {
    const data = await api.cattle.create(cattleData);
    
    await cacheManager.invalidate('cattle');
    
    return data;
  }

  async updateCattle(id: string | number, cattleData: Partial<CattleItem>): Promise<CattleItem> {
    const data = await api.cattle.update(id, cattleData);
    
    await cacheManager.invalidate('cattle');
    
    return data;
  }

  async deleteCattle(id: string | number): Promise<void> {
    await api.cattle.delete(id);
    
    await cacheManager.invalidate('cattle');
  }

  async getCattleMedicalRecords(cattleId: string | number): Promise<MedicalRecord[]> {
    const cacheKey = 'medical/by-cattle';
    const params = { cattleId: cattleId.toString() };
    
    const cachedData = await cacheManager.get<MedicalRecord[]>(cacheKey, params);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.cattle.getMedicalRecords(cattleId);
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.medical, params);
    
    return data;
  }

  async addMedicalRecord(cattleId: string | number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const data = await api.cattle.addMedicalRecord(cattleId, recordData);
    
    await cacheManager.invalidate('medical');
    
    return data;
  }

  async getAllUsers(): Promise<UserInfo[]> {
    const cacheKey = 'users/all';
    
    const cachedData = await cacheManager.get<UserInfo[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.users.getAll();
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.users);
    
    return data;
  }

  async getUserProfile(): Promise<UserInfo> {
    const cacheKey = 'users/profile';
    
    const cachedData = await cacheManager.get<UserInfo>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.users.getProfile();
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.users);
    
    return data;
  }

  async getFarmWorkers(farmId: string): Promise<UserInfo[]> {
    const cacheKey = 'users/farm-workers';
    const params = { farmId };
    
    const cachedData = await cacheManager.get<UserInfo[]>(cacheKey, params);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.farms.getWorkers(farmId);
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.users, params);
    
    return data;
  }

  async getFarmVeterinarians(farmId: string): Promise<UserInfo[]> {
    const cacheKey = 'users/farm-vets';
    const params = { farmId };
    
    const cachedData = await cacheManager.get<UserInfo[]>(cacheKey, params);
    if (cachedData) {
      return cachedData;
    }

    const data = await api.farms.getVeterinarians(farmId);
    await cacheManager.set(cacheKey, data, CACHE_CONFIGS.users, params);
    
    return data;
  }

  async registerUser(userData: RegisterData): Promise<any> {
    const data = await api.users.register(userData);
    await cacheManager.invalidate('users');
    return data;
  }

  async loginUser(credentials: LoginCredentials): Promise<UserInfo> {
    const data = await api.users.login(credentials);
    await cacheManager.clear();
    return data;
  }

  async logoutUser(): Promise<void> {
    await api.users.logout();
    await cacheManager.clear();
  }

  async updateUserProfile(data: UpdateProfileData): Promise<UserInfo> {
    const result = await api.users.updateProfile(data);
    await cacheManager.invalidate('users');
    return result;
  }

  async addFarmWorker(farmId: string, workerId: string): Promise<any> {
    const data = await api.farms.addWorker(farmId, workerId);
    await cacheManager.invalidate('users');
    return data;
  }

  async removeFarmWorker(farmId: string, workerId: string): Promise<void> {
    await api.farms.removeWorker(farmId, workerId);
    await cacheManager.invalidate('users');
  }

  async addFarmVeterinarian(farmId: string, vetId: string): Promise<any> {
    const data = await api.farms.addVeterinarian(farmId, vetId);
    await cacheManager.invalidate('users');
    return data;
  }

  async removeFarmVeterinarian(farmId: string, vetId: string): Promise<void> {
    await api.farms.removeVeterinarian(farmId, vetId);
    await cacheManager.invalidate('users');
  }

  async clearCache(): Promise<void> {
    await cacheManager.clear();
  }

  async invalidateCache(pattern: string): Promise<void> {
    await cacheManager.invalidate(pattern);
  }

  async cleanupExpiredCache(): Promise<void> {
    await cacheManager.cleanup();
  }

  getCacheStats() {
    return cacheManager.getStats();
  }

  async getCachedReportData(farmId: string | null): Promise<CachedReportData | null> {
    const cacheKey = 'reports/data';
    const params = { farmId: farmId || 'all' };
    
    const cachedData = await cacheManager.get<CachedReportData>(cacheKey, params);
    if (cachedData) {
      return cachedData;
    }
    
    return null;
  }

  async setCachedReportData(
    farmId: string | null, 
    reportData: ReportData, 
    cattleDetails: CattleDetail[],
    farmName: string
  ): Promise<void> {
    const cacheKey = 'reports/data';
    const params = { farmId: farmId || 'all' };
    
    const cachedReportData: CachedReportData = {
      reportData,
      cattleDetails,
      farmId,
      farmName,
      timestamp: Date.now()
    };
    
    await cacheManager.set(cacheKey, cachedReportData, CACHE_CONFIGS.reports, params);
  }

  async invalidateReportCache(farmId?: string | null): Promise<void> {
    if (farmId) {
      const cacheKey = 'reports/data';
      const params = { farmId };
      await cacheManager.invalidateKey(cacheKey, params);
    } else {
      await cacheManager.invalidate('reports');
    }
  }

  get directApi() {
    return api;
  }
}

export default new CachedApiService(); 