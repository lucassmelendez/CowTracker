import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  ttl?: number; // Time to live en milisegundos (por defecto 5 minutos)
  maxAge?: number; // Edad máxima en milisegundos (por defecto 30 minutos)
}

class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly DEFAULT_MAX_AGE = 30 * 60 * 1000; // 30 minutos

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Genera una clave de caché basada en el endpoint y parámetros
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `cache_${endpoint}_${paramString}`;
  }

  /**
   * Verifica si un elemento del caché es válido
   */
  private isValid(item: CacheItem<any>): boolean {
    const now = Date.now();
    return now < item.expiresAt;
  }

  /**
   * Obtiene datos del caché (memoria primero, luego AsyncStorage)
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    const key = this.generateKey(endpoint, params);

    // Verificar caché en memoria primero
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      console.log(`Cache HIT (memory): ${key}`);
      return memoryItem.data;
    }

    // Si no está en memoria o expiró, verificar AsyncStorage
    try {
      const storedItem = await AsyncStorage.getItem(key);
      if (storedItem) {
        const parsedItem: CacheItem<T> = JSON.parse(storedItem);
        if (this.isValid(parsedItem)) {
          // Restaurar en memoria para acceso rápido
          this.memoryCache.set(key, parsedItem);
          console.log(`Cache HIT (storage): ${key}`);
          return parsedItem.data;
        } else {
          // Eliminar elemento expirado
          await AsyncStorage.removeItem(key);
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Error al leer del caché:', error);
    }

    console.log(`Cache MISS: ${key}`);
    return null;
  }

  /**
   * Almacena datos en el caché (memoria y AsyncStorage)
   */
  async set<T>(
    endpoint: string, 
    data: T, 
    config: CacheConfig = {}, 
    params?: Record<string, any>
  ): Promise<void> {
    const key = this.generateKey(endpoint, params);
    const ttl = config.ttl || this.DEFAULT_TTL;
    const now = Date.now();

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    // Almacenar en memoria
    this.memoryCache.set(key, cacheItem);

    // Almacenar en AsyncStorage
    try {
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
      console.log(`Cache SET: ${key}`);
    } catch (error) {
      console.error('Error al escribir en el caché:', error);
    }
  }

  /**
   * Invalida caché por patrón de endpoint
   */
  async invalidate(pattern: string): Promise<void> {
    console.log(`Invalidando caché para patrón: ${pattern}`);

    // Invalidar caché en memoria
    const keysToDelete: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Invalidar caché en AsyncStorage
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => key.includes(pattern));
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.error('Error al invalidar caché en AsyncStorage:', error);
    }
  }

  /**
   * Invalida una clave específica
   */
  async invalidateKey(endpoint: string, params?: Record<string, any>): Promise<void> {
    const key = this.generateKey(endpoint, params);
    console.log(`Invalidando clave específica: ${key}`);

    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error al invalidar clave específica:', error);
    }
  }

  /**
   * Limpia todo el caché
   */
  async clear(): Promise<void> {
    console.log('Limpiando todo el caché');
    
    this.memoryCache.clear();
    
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }

  /**
   * Limpia elementos expirados del caché
   */
  async cleanup(): Promise<void> {
    console.log('Limpiando elementos expirados del caché');

    // Limpiar memoria
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        expiredKeys.push(key);
      }
    }
    expiredKeys.forEach(key => this.memoryCache.delete(key));

    // Limpiar AsyncStorage
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const storedItem = await AsyncStorage.getItem(key);
        if (storedItem) {
          const parsedItem: CacheItem<any> = JSON.parse(storedItem);
          if (!this.isValid(parsedItem)) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error al limpiar elementos expirados:', error);
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStats(): { memorySize: number; totalKeys: number } {
    return {
      memorySize: this.memoryCache.size,
      totalKeys: this.memoryCache.size
    };
  }
}

export default CacheManager.getInstance(); 