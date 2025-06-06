import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumActivationData {
  buy_order: string;
  amount: number;
  authorization_code: string;
  timestamp: number;
}

const PREMIUM_ACTIVATION_KEY = 'premium_activation_pending';

export class PremiumNotificationService {
  static async setPendingActivation(data: PremiumActivationData): Promise<void> {
    try {
      const activationData = {
        ...data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(PREMIUM_ACTIVATION_KEY, JSON.stringify(activationData));
    } catch (error) {
      console.error('❌ Error al guardar activación Premium:', error);
    }
  }

  static async getPendingActivation(): Promise<PremiumActivationData | null> {
    try {
      const data = await AsyncStorage.getItem(PREMIUM_ACTIVATION_KEY);
      if (data) {
        const activationData = JSON.parse(data);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        if (activationData.timestamp > fiveMinutesAgo) {
          await AsyncStorage.removeItem(PREMIUM_ACTIVATION_KEY);
          return activationData;
        } else {
          await AsyncStorage.removeItem(PREMIUM_ACTIVATION_KEY);
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener activación Premium:', error);
      return null;
    }
  }

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

  static async clearPendingActivation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREMIUM_ACTIVATION_KEY);
    } catch (error) {
      console.error('❌ Error al limpiar activación Premium:', error);
    }
  }
} 