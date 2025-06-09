import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar la gestión de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Canal de notificación personalizado para registros veterinarios
export const VETERINARY_CHANNEL_ID = 'veterinary-records';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    // Crear canal principal por defecto
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#27ae60',
    });
    
    // Canal específico para registros veterinarios
    await Notifications.setNotificationChannelAsync(VETERINARY_CHANNEL_ID, {
      name: 'Registros Veterinarios',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#27ae60',
      description: 'Notificaciones relacionadas con registros veterinarios del ganado',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('No se pudieron obtener permisos de notificación');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Se puede especificar si es necesario para notificaciones push
    })).data;
  } else {
    console.log('Las notificaciones push requieren un dispositivo físico');
  }

  return token;
}

export async function scheduleLocalNotification(title: string, body: string, data = {}) {
  // Solicitar permisos antes de programar una notificación
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      return false;
    }
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true, // Usar sonido por defecto
        color: '#27ae60',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
        // Usar el canal específico para veterinarios en Android
        ...(Platform.OS === 'android' && { channelId: VETERINARY_CHANNEL_ID }),
      },
      trigger: null, // Mostrar inmediatamente
    });
    return notificationId;
  } catch (error) {
    console.error('Error al programar la notificación:', error);
    return false;
  }
}

// Función para mostrar una notificación veterinaria
export async function showVeterinaryNotification(title: string, body: string, data = {}) {
  return scheduleLocalNotification(title, body, {
    type: 'veterinary',
    timestamp: new Date().toISOString(),
    ...data
  });
}

// Función para programar una notificación para una fecha y hora específicas
export async function scheduleNotificationForDateTime(title: string, body: string, scheduledDateTime: Date, data = {}) {
  // Solicitar permisos antes de programar una notificación
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      return false;
    }
  }

  try {
    // Verificar si la fecha es futura
    const now = new Date();
    if (scheduledDateTime <= now) {
      console.log('La fecha de programación debe ser futura:', scheduledDateTime);
      return false;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'veterinary',
          timestamp: new Date().toISOString(),
          scheduledFor: scheduledDateTime.toISOString(),
          ...data
        },
        sound: true,
        color: '#27ae60',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,        ...(Platform.OS === 'android' && { channelId: VETERINARY_CHANNEL_ID }),
      },
      trigger: {
        seconds: Math.max(1, (scheduledDateTime.getTime() - Date.now()) / 1000)
      },
    });
    
    console.log(`Notificación programada (ID: ${notificationId}) para: ${scheduledDateTime.toLocaleString()}`);
    return notificationId;
  } catch (error) {
    console.error('Error al programar la notificación con fecha:', error);
    return false;
  }
}

// Función específica para programar notificaciones de finalización de tratamientos veterinarios
export async function scheduleTreatmentEndNotification(
  cattleId: string,
  cattleName: string,
  treatmentEndTime: Date,
  diagnostico?: string,
  medicamento?: string
) {
  const title = '🐮 Fin de Tratamiento Veterinario';
  
  // Construir mensaje descriptivo
  let body = `El tratamiento para ${cattleName} ha finalizado.`;
  if (diagnostico) {
    body += ` Diagnóstico: ${diagnostico}.`;
  }
  if (medicamento) {
    body += ` Medicamento: ${medicamento}.`;
  }
  
  return scheduleNotificationForDateTime(
    title,
    body,
    treatmentEndTime,
    {
      type: 'veterinary',
      action: 'treatment-ended',
      cattleId,
      cattleName,
    }
  );
}

// Función para cancelar todas las notificaciones pendientes
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error al cancelar notificaciones:', error);
    return false;
  }
}

// Función para configurar un listener de respuesta a notificaciones
export function setupNotificationResponseListener(handler: (response: Notifications.NotificationResponse) => void) {
  const subscription = Notifications.addNotificationResponseReceivedListener(handler);
  return subscription;
}

// Función para configurar un listener de recepción de notificaciones (cuando la app está en primer plano)
export function setupNotificationListener(handler: (notification: Notifications.Notification) => void) {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return subscription;
}
