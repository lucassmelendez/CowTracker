import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar la gestión de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

// Canal de notificación personalizado para registros veterinarios
export const VETERINARY_CHANNEL_ID = 'veterinary-records';

// Registrar para notificaciones push
export async function registerForPushNotificationsAsync() {
  try {
    // Verificar si el dispositivo puede recibir notificaciones
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Si no tenemos permiso, solicitarlo
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Si el usuario no concedió permiso, salir
    if (finalStatus !== 'granted') {
      console.log('No se obtuvieron permisos para las notificaciones push');
      return false;
    }

    // En Android, necesitamos configurar los canales de notificación
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#27ae60',
      });

      await Notifications.setNotificationChannelAsync(VETERINARY_CHANNEL_ID, {
        name: 'Registros Veterinarios',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#27ae60',
        description: 'Notificaciones relacionadas con registros veterinarios del ganado',
      });
    }

    return true;
  } catch (error) {
    console.error('Error al registrar notificaciones push:', error);
    return false;
  }
}

// Inicializar notificaciones y solicitar permisos
export async function initializeNotifications() {
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

  // Solicitar permisos para notificaciones
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('No se pudieron obtener permisos de notificación');
      return false;
    }
  }

  return true;
}

// Función para mostrar notificación inmediata
export async function scheduleLocalNotification(title: string, body: string, data = {}) {
  // Verificar permisos
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
        sound: true,
        color: '#27ae60',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
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

// Función para mostrar una notificación veterinaria inmediata
export async function showVeterinaryNotification(title: string, body: string, data = {}) {
  return scheduleLocalNotification(title, body, {
    type: 'veterinary',
    timestamp: new Date().toISOString(),
    ...data
  });
}

// Función para programar una notificación para una fecha específica
export async function scheduleNotificationForDateTime(title: string, body: string, scheduledDateTime: Date, data = {}) {
  // Verificar permisos
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
        badge: 1,
        ...(Platform.OS === 'android' && { channelId: VETERINARY_CHANNEL_ID }),
      },      trigger: { 
        date: scheduledDateTime,
        type: 'date',
      }
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
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// Función para configurar un listener de recepción de notificaciones
export function setupNotificationListener(handler: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(handler);
}
