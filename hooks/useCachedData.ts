import { useState, useEffect, useCallback } from 'react';
import cachedApi from '../lib/services/cachedApi';
import { Farm, CattleItem, UserInfo, MedicalRecord } from '../lib/types';

interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

// Hook genérico para datos con caché
function useData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
): UseDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error en useData:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearCache = useCallback(async () => {
    await cachedApi.clearCache();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh, clearCache };
}

// Hook específico para granjas del usuario
export function useUserFarms(): UseDataState<Farm[]> {
  return useData(() => cachedApi.getUserFarms());
}

// Hook específico para todas las granjas
export function useAllFarms(): UseDataState<Farm[]> {
  return useData(() => cachedApi.getFarms());
}

// Hook específico para una granja por ID
export function useFarm(farmId: string | null): UseDataState<Farm> {
  return useData(
    () => {
      if (!farmId) throw new Error('ID de granja requerido');
      return cachedApi.getFarmById(farmId);
    },
    [farmId]
  );
}

// Hook específico para ganado de una granja
export function useFarmCattle(farmId: string | null): UseDataState<CattleItem[]> {
  return useData(
    () => {
      console.log('useFarmCattle - farmId recibido:', farmId);
      if (!farmId) {
        console.log('useFarmCattle - No hay farmId, devolviendo array vacío');
        return Promise.resolve([]);
      }
      console.log('useFarmCattle - Llamando a cachedApi.getFarmCattle con farmId:', farmId);
      return cachedApi.getFarmCattle(farmId);
    },
    [farmId]
  );
}

// Hook específico para todo el ganado
export function useAllCattle(): UseDataState<CattleItem[]> {
  return useData(() => cachedApi.getAllCattle());
}

// Hook específico para ganado con información de granja
export function useAllCattleWithFarmInfo(): UseDataState<CattleItem[]> {
  return useData(() => cachedApi.getAllCattleWithFarmInfo());
}

// Hook específico para un animal por ID
export function useCattle(cattleId: string | number | null): UseDataState<CattleItem> {
  return useData(
    () => {
      if (!cattleId) throw new Error('ID de ganado requerido');
      return cachedApi.getCattleById(cattleId);
    },
    [cattleId]
  );
}

// Hook específico para registros médicos de un animal
export function useCattleMedicalRecords(cattleId: string | number | null): UseDataState<MedicalRecord[]> {
  return useData(
    () => {
      if (!cattleId) return Promise.resolve([]);
      return cachedApi.getCattleMedicalRecords(cattleId);
    },
    [cattleId]
  );
}

// Hook específico para trabajadores de una granja
export function useFarmWorkers(farmId: string | null): UseDataState<UserInfo[]> {
  return useData(
    () => {
      if (!farmId) return Promise.resolve([]);
      return cachedApi.getFarmWorkers(farmId);
    },
    [farmId]
  );
}

// Hook específico para veterinarios de una granja
export function useFarmVeterinarians(farmId: string | null): UseDataState<UserInfo[]> {
  return useData(
    () => {
      if (!farmId) return Promise.resolve([]);
      return cachedApi.getFarmVeterinarians(farmId);
    },
    [farmId]
  );
}

// Hook específico para todos los usuarios
export function useAllUsers(): UseDataState<UserInfo[]> {
  return useData(() => cachedApi.getAllUsers());
}

// Hook específico para el perfil del usuario
export function useUserProfile(): UseDataState<UserInfo> {
  return useData(() => cachedApi.getUserProfile());
}

// Hook para operaciones de escritura con invalidación de caché
export function useDataMutations() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeWithCache = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error en la operación');
      console.error('Error en mutación:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Operaciones de granjas
  const createFarm = useCallback(
    (farmData: Partial<Farm>, onSuccess?: (farm: Farm) => void) =>
      executeWithCache(() => cachedApi.createFarm(farmData), onSuccess),
    [executeWithCache]
  );

  const updateFarm = useCallback(
    (id: string, farmData: Partial<Farm>, onSuccess?: (farm: Farm) => void) =>
      executeWithCache(() => cachedApi.updateFarm(id, farmData), onSuccess),
    [executeWithCache]
  );

  const deleteFarm = useCallback(
    (id: string, onSuccess?: () => void) =>
      executeWithCache(() => cachedApi.deleteFarm(id), onSuccess),
    [executeWithCache]
  );

  // Operaciones de ganado
  const createCattle = useCallback(
    (cattleData: Partial<CattleItem>, onSuccess?: (cattle: CattleItem) => void) =>
      executeWithCache(() => cachedApi.createCattle(cattleData), onSuccess),
    [executeWithCache]
  );

  const updateCattle = useCallback(
    (id: string | number, cattleData: Partial<CattleItem>, onSuccess?: (cattle: CattleItem) => void) =>
      executeWithCache(() => cachedApi.updateCattle(id, cattleData), onSuccess),
    [executeWithCache]
  );

  const deleteCattle = useCallback(
    (id: string | number, onSuccess?: () => void) =>
      executeWithCache(() => cachedApi.deleteCattle(id), onSuccess),
    [executeWithCache]
  );

  // Operaciones de registros médicos
  const addMedicalRecord = useCallback(
    (cattleId: string | number, recordData: Partial<MedicalRecord>, onSuccess?: (record: MedicalRecord) => void) =>
      executeWithCache(() => cachedApi.addMedicalRecord(cattleId, recordData), onSuccess),
    [executeWithCache]
  );

  return {
    loading,
    error,
    createFarm,
    updateFarm,
    deleteFarm,
    createCattle,
    updateCattle,
    deleteCattle,
    addMedicalRecord,
  };
}

// Hook para gestión del caché
export function useCacheManager() {
  const clearAllCache = useCallback(async () => {
    await cachedApi.clearCache();
  }, []);

  const invalidateCache = useCallback(async (pattern: string) => {
    await cachedApi.invalidateCache(pattern);
  }, []);

  const cleanupExpiredCache = useCallback(async () => {
    await cachedApi.cleanupExpiredCache();
  }, []);

  const getCacheStats = useCallback(() => {
    return cachedApi.getCacheStats();
  }, []);

  return {
    clearAllCache,
    invalidateCache,
    cleanupExpiredCache,
    getCacheStats,
  };
}

// Hook específico para datos de informes con caché
export function useReportData(farmId: string | null) {
  const [reportData, setReportData] = useState<import('../lib/types').ReportData | null>(null);
  const [cattleDetails, setCattleDetails] = useState<import('../lib/types').CattleDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Función para cargar datos del caché
  const loadFromCache = useCallback(async () => {
    try {
      const cachedData = await cachedApi.getCachedReportData(farmId);
      if (cachedData) {
        setReportData(cachedData.reportData);
        setCattleDetails(cachedData.cattleDetails);
        setLastUpdated(cachedData.timestamp);
        console.log('Datos de informe cargados desde caché');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al cargar datos del caché:', err);
      return false;
    }
  }, [farmId]);

  // Función para guardar datos en caché
  const saveToCache = useCallback(async (
    reportData: import('../lib/types').ReportData,
    cattleDetails: import('../lib/types').CattleDetail[],
    farmName: string
  ) => {
    try {
      await cachedApi.setCachedReportData(farmId, reportData, cattleDetails, farmName);
      setLastUpdated(Date.now());
      console.log('Datos de informe guardados en caché');
    } catch (err) {
      console.error('Error al guardar datos en caché:', err);
    }
  }, [farmId]);

  // Función para invalidar caché
  const invalidateCache = useCallback(async () => {
    try {
      await cachedApi.invalidateReportCache(farmId);
      setReportData(null);
      setCattleDetails([]);
      setLastUpdated(null);
      console.log('Caché de informes invalidado');
    } catch (err) {
      console.error('Error al invalidar caché:', err);
    }
  }, [farmId]);

  // Función para verificar si los datos están frescos (menos de 5 minutos)
  const isDataFresh = useCallback(() => {
    if (!lastUpdated) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return (Date.now() - lastUpdated) < fiveMinutes;
  }, [lastUpdated]);

  return {
    reportData,
    cattleDetails,
    loading,
    error,
    lastUpdated,
    loadFromCache,
    saveToCache,
    invalidateCache,
    isDataFresh,
    setReportData,
    setCattleDetails,
    setLoading,
    setError
  };
} 