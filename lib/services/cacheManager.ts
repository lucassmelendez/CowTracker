import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  ttl?: number;
  maxAge?: number;
}

class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000;
  private readonly DEFAULT_MAX_AGE = 30 * 60 * 1000;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `cache_${endpoint}_${paramString}`;
  }

  private isValid(item: CacheItem<any>): boolean {
    const now = Date.now();
    return now < item.expiresAt;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    const key = this.generateKey(endpoint, params);

    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    try {
      const storedItem = await AsyncStorage.getItem(key);
      if (storedItem) {
        const parsedItem: CacheItem<T> = JSON.parse(storedItem);
        if (this.isValid(parsedItem)) {
          this.memoryCache.set(key, parsedItem);
          return parsedItem.data;
        } else {
          await AsyncStorage.removeItem(key);
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Error al leer del caché:', error);
    }
    return null;
  }

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

    this.memoryCache.set(key, cacheItem);

    try {
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error al escribir en el caché:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.memoryCache.delete(key));

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

  async invalidateKey(endpoint: string, params?: Record<string, any>): Promise<void> {
    const key = this.generateKey(endpoint, params);

    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error al invalidar clave específica:', error);
    }
  }

  async clear(): Promise<void> {
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

  async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        expiredKeys.push(key);
      }
    }
    expiredKeys.forEach(key => this.memoryCache.delete(key));

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

  getStats(): { memorySize: number; totalKeys: number } {
    return {
      memorySize: this.memoryCache.size,
      totalKeys: this.memoryCache.size
    };
  }
}

export default CacheManager.getInstance(); 