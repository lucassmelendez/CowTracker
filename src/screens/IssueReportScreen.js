import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Linking,
  Dimensions,
  Clipboard
} from 'react-native';
// Importar de forma segura, con manejo de errores
let Device = null;
let Constants = null;

try {
  Device = require('expo-device');
  Constants = require('expo-constants');
} catch (error) {
  console.warn('No se pudieron cargar expo-device o expo-constants:', error);
}

import { reportStyles } from '../styles/reportStyles';
import { colors } from '../styles/commonStyles';
import { useAuth } from '../components/AuthContext';

const IssueReportScreen = () => {
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState('problema'); // 'problema' o 'sugerencia'
  const { userInfo } = useAuth();
  const supportEmail = 'soporte@cowtracker.cl';
    // Función para obtener información del dispositivo de manera segura
  const getDeviceInfo = async () => {
    try {
      // Información básica que siempre podemos obtener
      const info = {
        platform: Platform.OS || 'Desconocido',
        osVersion: Platform.Version || 'Desconocido',
        device: 'Dispositivo móvil',
        deviceName: 'Desconocido',
        screenWidth: 'Desconocido',
        screenHeight: 'Desconocido',
        appVersion: '1.0.0',
      };
      
      // Obtener el ancho y alto de la pantalla
      try {
        const { width, height } = Dimensions.get('window');
        info.screenWidth = width;
        info.screenHeight = height;
      } catch (e) {
        console.warn('Error al obtener dimensiones:', e);
      }
      
      // Intentar obtener información del dispositivo con expo-device si está disponible
      if (Device) {
        try {
          let deviceType = 'Desconocido';
          
          if (Device.DeviceType) {
            deviceType = Device.deviceType === Device.DeviceType.PHONE ? 'Smartphone' : 
                          Device.deviceType === Device.DeviceType.TABLET ? 'Tablet' : 'Desconocido';
          }
          
          info.deviceName = await Device.getDeviceNameAsync?.() || Device.deviceName || 'Desconocido';
          
          let deviceModel = 'Desconocido';
          let deviceBrand = 'Desconocido';
          
          if (Device.getModelAsync) {
            deviceModel = await Device.getModelAsync() || 'Desconocido';
          }
          
          if (Device.getBrandAsync) {
            deviceBrand = await Device.getBrandAsync() || 'Desconocido';
          }
          
          info.device = `${deviceBrand} ${deviceModel} (${deviceType})`;
        } catch (e) {
          console.warn('Error con expo-device:', e);
        }
      }
      
      // Intentar obtener versión de la aplicación si Constants está disponible
      if (Constants) {
        try {
          const appVersion = Constants.expoConfig?.version || 
                            Constants.manifest?.version || '1.0.0';
          
          const buildNumber = Constants.expoConfig?.ios?.buildNumber || 
                             Constants.expoConfig?.android?.versionCode || 
                             Constants.manifest?.ios?.buildNumber ||
                             Constants.manifest?.android?.versionCode || '1';
          
          info.appVersion = `${appVersion} (build ${buildNumber})`;
        } catch (e) {
          console.warn('Error con expo-constants:', e);
        }
      }
      
      return info;
    } catch (error) {
      console.error('Error general al obtener información del dispositivo:', error);
      return {
        platform: Platform.OS || 'Desconocido',
        osVersion: 'Desconocido',
        device: 'Desconocido',
        deviceName: 'Desconocido',
        screenWidth: 'Desconocido',
        screenHeight: 'Desconocido',
        appVersion: 'Desconocido',
      };
    }
  };

  const handleSendReport = async () => {
    if (reportText.trim() === '') {
      Alert.alert('Error', 'Por favor escribe tu reporte antes de enviarlo.');
      return;
    }
    
    try {
      // Datos del usuario para incluir en el correo
      const userName = userInfo?.primer_nombre ? 
        `${userInfo.primer_nombre} ${userInfo.primer_apellido}` : 
        'Usuario de CowTracker';
      const userEmail = userInfo?.email || 'No especificado';
      
      // Obtener información del dispositivo
      const deviceInfo = await getDeviceInfo();
      
      // Crear el asunto del correo
      const subject = encodeURIComponent(`Reporte de ${reportType}: CowTracker App - ${userName}`);
      
      // Crear el cuerpo del correo con formato
      const body = encodeURIComponent(
        `Reporte de ${reportType} de CowTracker\n\n` +
        `======= INFORMACIÓN DEL USUARIO =======\n` +
        `Usuario: ${userName}\n` +
        `Email: ${userEmail}\n` +
        `ID Usuario: ${userInfo?.uid || 'No disponible'}\n` +
        `Fecha: ${new Date().toLocaleDateString()}\n` +
        `Hora: ${new Date().toLocaleTimeString()}\n\n` +
        `======= DESCRIPCIÓN DEL ${reportType.toUpperCase()} =======\n` +
        `${reportText}\n\n` +
        `======= INFORMACIÓN TÉCNICA =======\n` +
        `Versión de la App: ${deviceInfo.appVersion}\n` +
        `Plataforma: ${deviceInfo.platform}\n` +
        `Versión del OS: ${deviceInfo.osVersion}\n` +
        `Dispositivo: ${deviceInfo.device}\n` +
        `Resolución: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}\n\n` +
        `--- Enviado desde la aplicación CowTracker ---`
      );
      
      // Crear el enlace mailto
      const mailtoLink = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
        // Crear el mensaje completo para poder copiarlo si es necesario
      const fullMessage = 
        `Reporte de ${reportType} de CowTracker\n\n` +
        `======= INFORMACIÓN DEL USUARIO =======\n` +
        `Usuario: ${userName}\n` +
        `Email: ${userEmail}\n` +
        `ID Usuario: ${userInfo?.uid || 'No disponible'}\n` +
        `Fecha: ${new Date().toLocaleDateString()}\n` +
        `Hora: ${new Date().toLocaleTimeString()}\n\n` +
        `======= DESCRIPCIÓN DEL ${reportType.toUpperCase()} =======\n` +
        `${reportText}\n\n` +
        `======= INFORMACIÓN TÉCNICA =======\n` +
        `Versión de la App: ${deviceInfo.appVersion}\n` +
        `Plataforma: ${deviceInfo.platform}\n` +
        `Versión del OS: ${deviceInfo.osVersion}\n` +
        `Dispositivo: ${deviceInfo.device}\n` +
        `Resolución: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}\n\n` +
        `--- Enviado desde la aplicación CowTracker ---`;
      
      try {
        // Verificar si se puede abrir el enlace
        const canOpen = await Linking.canOpenURL(mailtoLink);
        
        if (canOpen) {
          // Abrir la aplicación de correo predeterminada
          await Linking.openURL(mailtoLink);
          
          Alert.alert(
            'Reporte Preparado', 
            'Se ha preparado un correo electrónico con tu reporte. Completa el envío desde tu aplicación de correo.',
            [{ text: 'OK', onPress: () => setReportText('') }]
          );
        } else {
          // Si no se puede abrir el cliente de correo, ofrecer opciones alternativas
          Alert.alert(
            'No se pudo abrir la aplicación de correo', 
            'Tu reporte no pudo ser enviado automáticamente. ¿Qué deseas hacer?',
            [
              { 
                text: 'Copiar reporte', 
                onPress: async () => {
                  try {
                    // En versiones modernas de React Native
                    if (Clipboard?.setString) {
                      Clipboard.setString(fullMessage);
                      Alert.alert('Éxito', 'El reporte ha sido copiado al portapapeles. Puedes pegarlo en un correo a soporte@cowtracker.cl');
                    } else {
                      Alert.alert('Error', 'No se pudo copiar al portapapeles. Por favor, toma una captura de pantalla.');
                    }
                  } catch (e) {
                    console.error('Error al intentar copiar:', e);
                    Alert.alert('Error', 'No se pudo copiar al portapapeles. Por favor, toma una captura de pantalla.');
                  }
                }
              },
              { 
                text: 'Cancelar', 
                style: 'cancel'
              }
            ]
          );
        }
      } catch (linkError) {
        console.error('Error al abrir la aplicación de correo:', linkError);
        
        // Mostrar un mensaje de error
        Alert.alert(
          'Error al enviar correo',
          'No se pudo enviar el reporte por correo electrónico. Por favor, envía un correo manualmente a soporte@cowtracker.cl con los detalles de tu problema.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al enviar reporte por correo:', error);
      Alert.alert(
        'Error', 
        'Ocurrió un problema al intentar enviar tu reporte. Por favor intenta nuevamente.'
      );
    }
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Ayuda',
      'Si tienes problemas con la aplicación, por favor describe detalladamente el problema que estás experimentando y nuestro equipo de soporte te ayudará lo antes posible.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={reportStyles.container}
    >
      <ScrollView contentContainerStyle={reportStyles.scrollContainer}>        <View style={reportStyles.headerContainer}>
          <Text style={reportStyles.title}>Sistema de Reportes</Text>
          <Text style={reportStyles.subtitle}>
            Informa cualquier problema o sugerencia que tengas con la aplicación
          </Text>
        </View>
        
        <TouchableOpacity 
          style={reportStyles.problemButton}
          onPress={handleHelpPress}
        >
          <Text style={reportStyles.problemButtonText}>¿Tienes problemas?</Text>
        </TouchableOpacity>

        <View style={reportStyles.reportTypeContainer}>
          <Text style={reportStyles.inputLabel}>Tipo de reporte:</Text>
          <View style={reportStyles.reportTypeButtons}>
            <TouchableOpacity 
              style={[
                reportStyles.reportTypeButton, 
                reportType === 'problema' && reportStyles.reportTypeButtonSelected
              ]}
              onPress={() => setReportType('problema')}
            >
              <Text 
                style={[
                  reportStyles.reportTypeText,
                  reportType === 'problema' && reportStyles.reportTypeTextSelected
                ]}
              >
                Problema
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                reportStyles.reportTypeButton, 
                reportType === 'sugerencia' && reportStyles.reportTypeButtonSelected
              ]}
              onPress={() => setReportType('sugerencia')}
            >
              <Text 
                style={[
                  reportStyles.reportTypeText,
                  reportType === 'sugerencia' && reportStyles.reportTypeTextSelected
                ]}
              >
                Sugerencia
              </Text>
            </TouchableOpacity>
          </View>
        </View>
          <View style={reportStyles.inputContainer}>
          <Text style={reportStyles.inputLabel}>
            Detalla tu {reportType === 'problema' ? 'problema' : 'sugerencia'}
          </Text>
          <TextInput
            style={reportStyles.textInput}
            multiline
            numberOfLines={8}
            placeholder={
              reportType === 'problema' 
                ? "Describe detalladamente el problema que estás experimentando, incluyendo los pasos para reproducirlo..."
                : "Describe tu sugerencia para mejorar la aplicación..."
            }
            placeholderTextColor="#888"
            value={reportText}
            onChangeText={setReportText}
            textAlignVertical="top"
          />
          <Text style={reportStyles.infoText}>
            Se incluirá automáticamente información sobre tu dispositivo y la versión de la aplicación para ayudarnos a resolver el problema.
          </Text>
        </View>
          <TouchableOpacity 
          style={reportStyles.sendButton}
          onPress={handleSendReport}
        >
          <Text style={reportStyles.sendButtonText}>
            Enviar {reportType === 'problema' ? 'Problema' : 'Sugerencia'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default IssueReportScreen;