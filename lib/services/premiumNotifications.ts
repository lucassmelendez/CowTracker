import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumActivationData {
  buy_order: string;
  amount: number;
  authorization_code: string;
  timestamp: number;
}

const PREMIUM_ACTIVATION_KEY = 'premium_activation_pending';

export class PremiumNotificationService {
  
  // Guardar datos de activación Premium para mostrar después
  static async setPendingActivation(data: PremiumActivationData): Promise<void> {
    try {
      const activationData = {
        ...data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(PREMIUM_ACTIVATION_KEY, JSON.stringify(activationData));
      console.log('✅ Datos de activación Premium guardados:', activationData);
    } catch (error) {
      console.error('❌ Error al guardar activación Premium:', error);
    }
  }

  // Obtener y limpiar datos de activación pendiente
  static async getPendingActivation(): Promise<PremiumActivationData | null> {
    try {
      const data = await AsyncStorage.getItem(PREMIUM_ACTIVATION_KEY);
      if (data) {
        const activationData = JSON.parse(data);
        
        // Verificar que no sea muy antigua (máximo 5 minutos)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (activationData.timestamp > fiveMinutesAgo) {
          // Limpiar después de obtener
          await AsyncStorage.removeItem(PREMIUM_ACTIVATION_KEY);
          console.log('✅ Datos de activación Premium recuperados:', activationData);
          return activationData;
        } else {
          // Limpiar datos antiguos
          await AsyncStorage.removeItem(PREMIUM_ACTIVATION_KEY);
          console.log('🗑️ Datos de activación Premium expirados, limpiados');
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener activación Premium:', error);
      return null;
    }
  }

  // Verificar si hay activación pendiente sin limpiar
  static async hasPendingActivation(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(PREMIUM_ACTIVATION_KEY);
      if (data) {
        const activationData = JSON.parse(data);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        return activationData.timestamp > fiveMinutesAgo;
      }
      return false;
    } catch (error) {
      console.error('❌ Error al verificar activación Premium:', error);
      return false;
    }
  }

  // Limpiar datos de activación
  static async clearPendingActivation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREMIUM_ACTIVATION_KEY);
      console.log('🗑️ Datos de activación Premium limpiados');
    } catch (error) {
      console.error('❌ Error al limpiar activación Premium:', error);
    }
  }
} 