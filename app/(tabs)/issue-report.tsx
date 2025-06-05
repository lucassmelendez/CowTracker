import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Linking,
  Dimensions,
  Clipboard,
  StyleSheet
} from 'react-native';
// import { Stack } from 'expo-router'; // Removido para usar el header del layout
import { useAuth } from '../../components/AuthContext';
import { useCustomModal } from '../../components/CustomModal';

export default function IssueReport() {
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState('problema'); // 'problema' o 'sugerencia'
  const { userInfo } = useAuth();
  const supportEmail = 'soporte@cowtracker.cl';
  
  // Hook para modales personalizados
  const { showSuccess, showError, showConfirm, ModalComponent } = useCustomModal();

  // Función para obtener información del dispositivo de manera segura
  const getDeviceInfo = async () => {
    try {
      // Información básica que siempre podemos obtener
      const info = {
        platform: Platform.OS || 'Desconocido',
        osVersion: Platform.Version?.toString() || 'Desconocido',
        device: Platform.OS === 'ios' ? 'Dispositivo iOS' : Platform.OS === 'android' ? 'Dispositivo Android' : 'Dispositivo Web',
        deviceName: 'Dispositivo móvil',
        screenWidth: 'Desconocido',
        screenHeight: 'Desconocido',
        appVersion: '1.0.0',
      };
      
      // Obtener el ancho y alto de la pantalla
      try {
        const { width, height } = Dimensions.get('window');
        info.screenWidth = width.toString();
        info.screenHeight = height.toString();
      } catch (e) {
        console.warn('Error al obtener dimensiones:', e);
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
      showError('Error', 'Por favor escribe tu reporte antes de enviarlo.');
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
          
          showSuccess(
            'Reporte Preparado', 
            'Se ha preparado un correo electrónico con tu reporte. Completa el envío desde tu aplicación de correo.',
            () => setReportText('')
          );
        } else {
          // Si no se puede abrir el cliente de correo, ofrecer opciones alternativas
          showConfirm(
            'No se pudo abrir la aplicación de correo', 
            'Tu reporte no pudo ser enviado automáticamente. ¿Deseas copiar el reporte al portapapeles?',
            async () => {
              await Clipboard.setString(fullMessage);
              showSuccess(
                'Reporte copiado', 
                `Tu reporte ha sido copiado al portapapeles. Puedes pegarlo en un correo a: ${supportEmail}`,
                () => setReportText('')
              );
            },
            'Copiar reporte',
            'Cancelar'
          );
        }
      } catch (linkingError) {
        console.error('Error al abrir enlace:', linkingError);
        
        // Fallback: copiar al portapapeles
        showConfirm(
          'Error al enviar', 
          'No se pudo abrir la aplicación de correo. ¿Deseas copiar el reporte al portapapeles?',
          async () => {
            await Clipboard.setString(fullMessage);
            showSuccess(
              'Reporte copiado', 
              `Tu reporte ha sido copiado al portapapeles. Puedes pegarlo en un correo a: ${supportEmail}`,
              () => setReportText('')
            );
          },
          'Copiar',
          'Cancelar'
        );
      }
    } catch (error) {
      console.error('Error al preparar el reporte:', error);
      showError('Error', 'Hubo un problema al preparar tu reporte. Por favor intenta de nuevo.');
    }
  };

  const handleHelpPress = () => {
    showSuccess(
      'Ayuda para reportar problemas',
      'Para reportar un problema o sugerencia:\n\n' +
      '1. Selecciona el tipo de reporte\n' +
      '2. Describe detalladamente el problema o sugerencia\n' +
      '3. Presiona "Enviar Reporte"\n' +
      '4. Se abrirá tu aplicación de correo con toda la información\n\n' +
      'Incluye toda la información posible para ayudarnos a resolver tu problema más rápido.'
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* <Stack.Screen options={{ headerTitle: 'Reportar Problema' }} /> */}
      {/* Header manejado por el layout */}
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Reportar Problema o Sugerencia</Text>
            <Text style={styles.subtitle}>
              Ayúdanos a mejorar CowTracker reportando problemas o enviando sugerencias
            </Text>
          </View>

          <View style={styles.typeSelector}>
            <Text style={styles.sectionTitle}>Tipo de reporte:</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reportType === 'problema' && styles.typeButtonActive
                ]}
                onPress={() => setReportType('problema')}
              >
                <Text style={[
                  styles.typeButtonText,
                  reportType === 'problema' && styles.typeButtonTextActive
                ]}>
                  🐛 Problema
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reportType === 'sugerencia' && styles.typeButtonActive
                ]}
                onPress={() => setReportType('sugerencia')}
              >
                <Text style={[
                  styles.typeButtonText,
                  reportType === 'sugerencia' && styles.typeButtonTextActive
                ]}>
                  💡 Sugerencia
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>
              Describe tu {reportType}:
            </Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={8}
              value={reportText}
              onChangeText={setReportText}
              placeholder={
                reportType === 'problema' 
                  ? 'Describe el problema que encontraste. Incluye los pasos para reproducirlo si es posible...'
                  : 'Describe tu sugerencia para mejorar la aplicación...'
              }
              textAlignVertical="top"
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>ℹ️ Información incluida automáticamente:</Text>
            <Text style={styles.infoText}>
              • Tu información de usuario{'\n'}
              • Información del dispositivo{'\n'}
              • Versión de la aplicación{'\n'}
              • Fecha y hora del reporte
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleHelpPress}
            >
              <Text style={styles.helpButtonText}>❓ Ayuda</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                reportText.trim() === '' && styles.sendButtonDisabled
              ]}
              onPress={handleSendReport}
              disabled={reportText.trim() === ''}
            >
              <Text style={styles.sendButtonText}>
                📧 Enviar {reportType}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Contacto directo:</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
            >
              <Text style={styles.contactEmail}>{supportEmail}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Modal personalizado */}
      <ModalComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  typeSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  typeButtonActive: {
    borderColor: '#27ae60',
    backgroundColor: '#27ae6010',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  typeButtonTextActive: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  helpButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  helpButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  sendButton: {
    flex: 2,
    padding: 15,
    backgroundColor: '#27ae60',
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  contactInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  contactEmail: {
    fontSize: 16,
    color: '#27ae60',
    textDecorationLine: 'underline',
  },
}); 