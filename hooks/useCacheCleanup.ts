import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cacheManager from '../lib/services/cacheManager';

export const useCacheCleanup = () => {
  const clearAllUserData = useCallback(async (): Promise<void> => {
    try {
      console.log('Iniciando limpieza completa de datos de usuario...');
      
      // 1. Limpiar el cache del sistema
      await cacheManager.clear();
      console.log('✓ Cache del sistema limpiado');
      
      // 2. Limpiar datos específicos conocidos
      const specificKeys = [
        'selectedFarm',
        'userPreferences',
        'lastSync',
        'offlineData',
        'farmPreferences',
        'cattleFilters',
        'appSettings'
      ];
      
      await AsyncStorage.multiRemove(specificKeys);
      console.log('✓ Datos específicos limpiados');
      
      // 3. Limpiar datos por patrones
      const allKeys = await AsyncStorage.getAllKeys();
      const userDataKeys = allKeys.filter(key => 
        key.includes('user_') || 
        key.includes('farm_') || 
        key.includes('cattle_') ||
        key.includes('auth_') ||
        key.includes('cache_') ||
        key.includes('medical_') ||
        key.includes('report_') ||
        key.includes('sync_')
      );
      
      if (userDataKeys.length > 0) {
        await AsyncStorage.multiRemove(userDataKeys);
        console.log(`✓ ${userDataKeys.length} claves adicionales limpiadas`);
      }
      
      // 4. Verificar limpieza
      const remainingKeys = await AsyncStorage.getAllKeys();
      const remainingUserKeys = remainingKeys.filter(key => 
        key.includes('user_') || 
        key.includes('farm_') || 
        key.includes('cattle_')
      );
      
      if (remainingUserKeys.length > 0) {
        console.warn('Advertencia: Algunas claves no fueron limpiadas:', remainingUserKeys);
      } else {
        console.log('✓ Limpieza completa exitosa');
      }
      
    } catch (error) {
      console.error('Error durante la limpieza de datos:', error);
      throw error;
    }
  }, []);

  const clearSpecificCache = useCallback(async (pattern: string): Promise<void> => {
    try {
      console.log(`Limpiando cache específico: ${pattern}`);
      
      const allKeys = await AsyncStorage.getAllKeys();
      const matchingKeys = allKeys.filter(key => 
        key.includes(pattern) || key.includes(`cache_${pattern}`)
      );
      
      if (matchingKeys.length > 0) {
        await AsyncStorage.multiRemove(matchingKeys);
        console.log(`✓ ${matchingKeys.length} claves de ${pattern} limpiadas`);
      }
      
    } catch (error) {
      console.error(`Error al limpiar cache de ${pattern}:`, error);
      throw error;
    }
  }, []);

  return {
    clearAllUserData,
    clearSpecificCache
  };
}; 