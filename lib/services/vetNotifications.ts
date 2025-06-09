import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { VETERINARY_CHANNEL_ID, scheduleLocalNotification } from './notificationService';

// Función para programar una notificación de tratamiento veterinario
export async function scheduleTreatmentNotification(
  cattleId: string,
  cattleName: string, 
  treatmentEndTime: Date,
  diagnostico?: string,
  medicamento?: string
): Promise<string | boolean> {
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
    if (treatmentEndTime <= now) {
      console.log('La fecha de fin de tratamiento debe ser futura:', treatmentEndTime);
      return false;
    }

    // Crear título y cuerpo de la notificación
    const title = '🐮 Fin de Tratamiento Veterinario';
    
    // Construir mensaje descriptivo
    let body = `El tratamiento para ${cattleName} ha finalizado.`;
    if (diagnostico) {
      body += ` Diagnóstico: ${diagnostico}.`;
    }
    if (medicamento) {
      body += ` Medicamento: ${medicamento}.`;
    }

    // Programar la notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'veterinary',
          action: 'treatment-ended',
          timestamp: new Date().toISOString(),
          scheduledFor: treatmentEndTime.toISOString(),
          cattleId,
          cattleName
        },
        sound: true,
        color: '#27ae60',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
        ...(Platform.OS === 'android' && { channelId: VETERINARY_CHANNEL_ID }),
      },
      trigger: { 
        date: treatmentEndTime
      },
    });
    
    console.log(`Notificación de fin de tratamiento programada (ID: ${notificationId}) para: ${treatmentEndTime.toLocaleString()} - Ganado: ${cattleName}`);
    return notificationId;
  } catch (error) {
    console.error('Error al programar la notificación de fin de tratamiento:', error);
    return false;
  }
}

// Función para calcular la fecha de fin de tratamiento basada en fecha de inicio y cantidad de horas
export function calculateTreatmentEndDate(
  startDate: string | Date, 
  hoursInterval: number | string, 
  dosesCount: number | string = 1
): Date {
  // Convertir parámetros a los tipos correctos
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const hours = typeof hoursInterval === 'string' ? parseFloat(hoursInterval) : hoursInterval;
  const doses = typeof dosesCount === 'string' ? parseInt(dosesCount, 10) : dosesCount;
  
  // Si no hay información válida, retornar fecha actual
  if (!start || isNaN(start.getTime()) || !hours || isNaN(hours) || hours <= 0 || !doses || isNaN(doses) || doses <= 0) {
    return new Date();
  }
  
  // Calcular la fecha de fin sumando las horas totales
  const totalHours = hours * doses;
  const endDate = new Date(start);
  endDate.setHours(endDate.getHours() + totalHours);
  
  return endDate;
}

// Verificar si existe un tratamiento activo en base a la información veterinaria
export function hasTreatmentActive(vetInfo: any): boolean {
  if (!vetInfo) return false;
  
  // Si tiene fecha de inicio pero no de fin o la fecha de fin es futura
  if (vetInfo.fecha_ini_tratamiento) {
    if (!vetInfo.fecha_fin_tratamiento) {
      return true;
    }
    
    const endDate = new Date(vetInfo.fecha_fin_tratamiento);
    return endDate > new Date();
  }
  
  return false;
}

// Programar notificación de tratamiento basada en la información veterinaria
export async function scheduleTreatmentNotificationFromVetInfo(
  cattleId: string,
  cattleName: string,
  vetInfo: any
): Promise<string | boolean> {
  if (!vetInfo) return false;
  
  // Si tiene fecha de inicio y cantidad de horas, calculamos la fecha de fin
  if (vetInfo.fecha_ini_tratamiento && vetInfo.cantidad_horas) {
    // Calculamos la fecha de finalización del tratamiento
    const endDate = calculateTreatmentEndDate(
      vetInfo.fecha_ini_tratamiento,
      vetInfo.cantidad_horas
    );
    
    // Si la fecha es futura, programamos la notificación
    if (endDate > new Date()) {
      return scheduleTreatmentNotification(
        cattleId,
        cattleName,
        endDate,
        vetInfo.diagnostico,
        vetInfo.medicamento
      );
    }
  }
  
  // Si ya tiene fecha de fin explícita y es futura
  if (vetInfo.fecha_fin_tratamiento) {
    const endDate = new Date(vetInfo.fecha_fin_tratamiento);
    if (endDate > new Date()) {
      return scheduleTreatmentNotification(
        cattleId,
        cattleName,
        endDate,
        vetInfo.diagnostico,
        vetInfo.medicamento
      );
    }
  }
  
  return false;
}
