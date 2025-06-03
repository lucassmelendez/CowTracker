import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WEBPAY_URLS, fetchWithCORS } from '../src/config/api';
import { useAuth } from './AuthContext';

const PremiumUpgradeModal = ({ visible, onClose, title = "¡Actualiza a Premium!", subtitle = "Desbloquea todo el potencial de CowTracker" }) => {
  const { userInfo } = useAuth();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState('$10.000');
  const [setIsLoadingPrice] = useState(false);

  // Función para obtener la conversión de precio
  const fetchPriceConversion = async () => {
    try {
      setIsLoadingPrice(true);
      
      // Llamar al endpoint de conversión de FastAPI
      const response = await fetchWithCORS('https://ct-fastapi.vercel.app/currency/convert?amount=10000&from_currency=CLP&to_currency=USD');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.formatted && data.formatted.combined) {
        setPriceDisplay(data.formatted.combined);
        console.log('✅ Conversión de precio obtenida:', data.formatted.combined);
      } else {
        console.warn('⚠️ No se pudo obtener la conversión, usando precio por defecto');
        setPriceDisplay('$10.000');
      }
    } catch (error) {
      console.error('❌ Error al obtener conversión de precio:', error);
      // En caso de error, mantener el precio por defecto
      setPriceDisplay('$10.000');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Cargar la conversión cuando el modal se abre
  useEffect(() => {
    if (visible) {
      fetchPriceConversion();
    }
  }, [visible]);

  // Función para procesar el pago premium
  const handlePremiumUpgrade = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Generar un buy_order corto (máximo 26 caracteres)
      const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos del timestamp
      const userIdShort = userInfo?.uid?.slice(-8) || 'user'; // Últimos 8 caracteres del UID
      const buyOrder = `prem_${userIdShort}_${timestamp}`.slice(0, 26); // Máximo 26 caracteres
      
      // Configuración de la transacción
      const paymentData = {
        amount: 10000, // $10.000 pesos chilenos
        buy_order: buyOrder,
        session_id: `sess_${timestamp}`,
        return_url: WEBPAY_URLS.return,
        description: 'Actualización a CowTracker Premium'
      };

      console.log('Iniciando transacción Webpay con datos:', paymentData);

      // Llamar a tu API de FastAPI en Vercel para crear la transacción usando fetchWithCORS
      const response = await fetchWithCORS(WEBPAY_URLS.createTransaction, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respuesta de la API:', result);

      if (result.success && result.url && result.token) {
        // Cerrar el modal antes de redirigir
        onClose();
        
        console.log('✅ Transacción creada exitosamente');
        console.log('🔗 URL de Webpay:', result.url);
        console.log('🎫 Token:', result.token);
        
        // Crear la URL completa de Webpay con el token
        const webpayUrl = `${result.url}?token_ws=${result.token}`;
        console.log('🌐 URL completa de redirección:', webpayUrl);
        
        console.log('🚨 A punto de mostrar Alert...');
        
        // Detectar si estamos en web
        const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';
        console.log('🌐 Plataforma detectada:', Platform.OS, 'Es web:', isWeb);
        
        // Si estamos en web, redirigir directamente sin Alert
        if (isWeb) {
          console.log('🌐 Redirección directa en web...');
          try {
            window.open(webpayUrl, '_blank', 'noopener,noreferrer');
            console.log('✅ URL abierta exitosamente en web');
            
            // Mostrar mensaje de confirmación
            Alert.alert(
              'Redirección Exitosa',
              'Se ha abierto Webpay en una nueva pestaña. Si no se abrió automáticamente, usa este enlace:\n\n' + webpayUrl,
              [{ text: 'OK' }]
            );
          } catch (webError) {
            console.error('❌ Error en redirección web:', webError);
            // Mostrar la URL al usuario como fallback
            Alert.alert(
              'Abrir Webpay Manualmente',
              `Copia y pega esta URL en tu navegador:\n\n${webpayUrl}`,
              [
                {
                  text: 'Copiar URL',
                  onPress: () => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(webpayUrl);
                    }
                  }
                },
                { text: 'OK' }
              ]
            );
          }
        } else {
          // Para móvil, mostrar el Alert original
          console.log('📱 Mostrando Alert para móvil...');
          Alert.alert(
            'Redirigiendo a Webpay',
            'Serás redirigido al sistema de pagos de Transbank para completar tu compra.',
            [
              {
                text: 'Continuar',
                onPress: async () => {
                  try {
                    console.log('🚀 Intentando abrir URL en móvil:', webpayUrl);
                    
                    const supported = await Linking.canOpenURL(webpayUrl);
                    console.log('🔍 URL soportada en móvil:', supported);
                    
                    if (supported) {
                      console.log('✅ Abriendo URL en navegador móvil...');
                      await Linking.openURL(webpayUrl);
                      console.log('✅ URL abierta exitosamente en móvil');
                    } else {
                      throw new Error('URL no soportada en esta plataforma móvil');
                    }
                  } catch (linkingError) {
                    console.error('❌ Error al abrir Webpay:', linkingError);
                    
                    Alert.alert(
                      'Abrir Webpay Manualmente',
                      `No se pudo abrir automáticamente. Por favor, copia y pega esta URL en tu navegador:\n\n${webpayUrl}`,
                      [
                        {
                          text: 'Copiar URL',
                          onPress: () => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(webpayUrl);
                            }
                          }
                        },
                        { text: 'OK' }
                      ]
                    );
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
      } else {
        console.error('❌ Respuesta inválida:', result);
        throw new Error(result.message || 'Error al crear la transacción');
      }
    } catch (error) {
      console.error('Error al procesar el pago premium:', error);
      
      let errorMessage = 'No se pudo procesar el pago. ';
      
      // Manejo específico de errores de CORS
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        errorMessage = 'Error de conectividad. La API está actualizándose. Por favor, intenta nuevamente en unos minutos.';
      } else if (error.message.includes('fetch')) {
        errorMessage += 'Verifica tu conexión a internet.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage += 'El servidor está temporalmente no disponible.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Por favor, intenta nuevamente.';
      }
      
      Alert.alert(
        'Error de Pago', 
        errorMessage,
        [
          { 
            text: 'Reintentar', 
            onPress: () => {
              // Permitir reintentar después de un breve delay
              setTimeout(() => {
                setIsProcessingPayment(false);
              }, 1000);
            }
          },
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => setIsProcessingPayment(false)
          }
        ]
      );
      return; // No ejecutar el finally si estamos reintentando
    } finally {
      // Solo resetear si no estamos reintentando
      if (!isProcessingPayment) {
        setIsProcessingPayment(false);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.premiumModalContent}>
          {/* Header con gradiente */}
          <View style={styles.premiumModalHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="diamond" size={50} color="#fff" />
            </View>
            <Text style={styles.premiumModalTitle}>
              {title}
            </Text>
            <Text style={styles.premiumModalSubtitle}>
              {subtitle}
            </Text>
          </View>
          
          {/* Contenido principal */}
          <View style={styles.premiumModalBody}>
            <Text style={styles.benefitsTitle}>
              Con Premium obtienes:
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Registro ilimitado de ganado</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Reportes avanzados y estadísticas</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Exportación de datos a Excel/PDF</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Soporte prioritario 24/7</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Sincronización en la nube</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{priceDisplay}</Text>
              <Text style={styles.priceSubtext}>Pago único - Acceso de por vida</Text>
            </View>
          </View>
          
          {/* Botones de acción */}
          <View style={styles.premiumModalButtons}>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                isProcessingPayment && styles.disabledButton
              ]}
              onPress={handlePremiumUpgrade}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.upgradeButtonText}>
                    Procesando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="diamond" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.upgradeButtonText}>
                    Pagar {priceDisplay} - Actualizar a Premium
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.laterButton,
                isProcessingPayment && styles.disabledButton
              ]}
              onPress={onClose}
              disabled={isProcessingPayment}
            >
              <Text style={styles.laterButtonText}>
                Tal vez más tarde
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón de cerrar */}
          <TouchableOpacity
            style={[
              styles.closeButton,
              isProcessingPayment && styles.disabledButton
            ]}
            onPress={onClose}
            disabled={isProcessingPayment}
          >
            <Ionicons name="close" size={24} color="#95a5a6" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumModalHeader: {
    backgroundColor: '#27ae60',
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumModalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  premiumModalBody: {
    padding: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  benefitText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#34495e',
    flex: 1,
  },
  priceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  premiumModalButtons: {
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#27ae60',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  laterButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    backgroundColor: '#fff',
  },
  laterButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
});

export default PremiumUpgradeModal; 