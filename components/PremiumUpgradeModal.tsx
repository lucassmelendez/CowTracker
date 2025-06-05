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
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { WEBPAY_URLS, fetchWithCORS } from '../lib/config/api';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import { useCacheManager } from '../hooks/useCachedData';
import CongratulationsModal from './CongratulationsModal';
import { PremiumNotificationService } from '../lib/services/premiumNotifications';

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

interface PaymentData {
  amount: number;
  buy_order: string;
  session_id: string;
  return_url: string;
  description: string;
}

interface PaymentResponse {
  success: boolean;
  url?: string;
  token?: string;
  message?: string;
}

interface CurrencyConversionResponse {
  success: boolean;
  formatted?: {
    combined?: string;
  };
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ 
  visible, 
  onClose, 
  title = "¡Actualiza a Premium!", 
  subtitle = "Desbloquea todo el potencial de CowTracker" 
}) => {
  const { userInfo, updateProfile } = useAuth();
  const router = useRouter();
  const { invalidateCache } = useCacheManager();
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [priceDisplay, setPriceDisplay] = useState<string>('$10.000');
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  
  // Nuevos estados para el WebView
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [webViewUrl, setWebViewUrl] = useState<string>('');
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [isWebViewLoading, setIsWebViewLoading] = useState<boolean>(true);
  const [currentBuyOrder, setCurrentBuyOrder] = useState<string>('');
  
  // Estado para el modal de felicitaciones
  const [showCongratulations, setShowCongratulations] = useState<boolean>(false);
  const [congratulationsData, setCongratulationsData] = useState<any>(null);
  const [isActivatingPremium, setIsActivatingPremium] = useState<boolean>(false);

  // Función para obtener la conversión de precio
  const fetchPriceConversion = async (): Promise<void> => {
    try {
      setIsLoadingPrice(true);
      
      // Llamar al endpoint de conversión de FastAPI
      const response = await fetchWithCORS('https://ct-fastapi.vercel.app/currency/convert?amount=10000&from_currency=CLP&to_currency=USD');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CurrencyConversionResponse = await response.json();
      
      if (data.success && data.formatted && data.formatted.combined) {
        setPriceDisplay(data.formatted.combined);
      } else {
        setPriceDisplay('$10.000');
      }
    } catch (error) {
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

  // Función para hacer polling del estado del pago en web
  const startPaymentPolling = (buyOrder: string) => {
    console.log('🔄 Iniciando polling para verificar pago:', buyOrder);
    
    const pollInterval = setInterval(async () => {
      try {
        // Verificar el estado del pago en el backend
        const response = await fetchWithCORS(`https://ct-fastapi.vercel.app/webpay/status/${buyOrder}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.status === 'AUTHORIZED') {
            console.log('✅ Pago confirmado por polling:', result);
            clearInterval(pollInterval);
            
            // Simular datos de pago exitoso
            handlePaymentSuccess({
              buy_order: buyOrder,
              amount: 10000,
              authorization_code: result.authorization_code || 'WEB_' + Date.now(),
              transaction_date: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.log('⏳ Verificando estado del pago...', error);
      }
    }, 3000); // Verificar cada 3 segundos

    // Limpiar el polling después de 5 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('⏰ Polling de pago terminado por timeout');
    }, 300000);
  };

  // Función para procesar el pago premium
  const handlePremiumUpgrade = async (): Promise<void> => {
    try {
      setIsProcessingPayment(true);
      
      // Generar un buy_order corto (máximo 26 caracteres)
      const timestamp = Date.now().toString().slice(-8);
      const userIdShort = userInfo?.uid?.slice(-8) || 'user';
      const buyOrder = `prem_${userIdShort}_${timestamp}`.slice(0, 26);
      
      // Configuración de la transacción
      const paymentData: PaymentData = {
        amount: 10000,
        buy_order: buyOrder,
        session_id: `sess_${timestamp}`,
        return_url: WEBPAY_URLS.return,
        description: 'Actualización a CowTracker Premium'
      };

      // Llamar a la API para crear la transacción
      const response = await fetchWithCORS(WEBPAY_URLS.createTransaction, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PaymentResponse = await response.json();

      if (result.success && result.url && result.token) {
        const webpayUrl = `${result.url}?token_ws=${result.token}`;
        setWebViewUrl(webpayUrl);
        setPaymentToken(result.token);
        setCurrentBuyOrder(buyOrder);
        
        // En web y móvil, usar el modal integrado
        setShowWebView(true);
        
        // En web, iniciar polling para verificar el estado del pago
        if (Platform.OS === 'web') {
          startPaymentPolling(buyOrder);
        }
        
        setIsProcessingPayment(false);
      } else {
        console.error('❌ Respuesta inválida:', result);
        throw new Error(result.message || 'Error al crear la transacción');
      }
    } catch (error: any) {
      console.error('Error al procesar el pago premium:', error);
      
      let errorMessage = 'No se pudo procesar el pago. ';
      
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
      return;
    } finally {
      if (!isProcessingPayment) {
        setIsProcessingPayment(false);
      }
    }
  };

  // Función para manejar mensajes del WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📨 Mensaje recibido del WebView:', message);
      
      if (message.type === 'PAYMENT_SUCCESS') {
        console.log('✅ Pago exitoso confirmado por WebView');
        handlePaymentSuccess(message.data);
      }
    } catch (error) {
      console.error('❌ Error al procesar mensaje del WebView:', error);
    }
  };

  // Función para manejar el éxito del pago
  const handlePaymentSuccess = async (paymentData: any) => {
    setShowWebView(false);
    setIsWebViewLoading(true);
    setIsActivatingPremium(true);
    
    try {
      console.log('🔄 Iniciando proceso de activación Premium...');
      
      // Activar Premium en el backend
      await activatePremiumAccount(paymentData);
      
      console.log('✅ Premium activado, iniciando navegación...');
      
      // Limpiar caché para que se cargue el nuevo estado
      console.log('🗑️ Limpiando caché...');
      await invalidateCache('users/profile');
      await invalidateCache('farms');
      
      // Guardar datos para mostrar felicitaciones después
      await PremiumNotificationService.setPendingActivation({
        buy_order: paymentData.buy_order,
        amount: paymentData.amount,
        authorization_code: paymentData.authorization_code,
        timestamp: Date.now()
      });
      
      setIsActivatingPremium(false);
      
      // Cerrar el modal de pago
      onClose();
      
      // Navegar al perfil después de un breve delay
      setTimeout(() => {
        console.log('🧭 Navegando al perfil después de activación...');
        try {
          router.replace('/(tabs)/profile');
        } catch (navError) {
          console.error('❌ Error en navegación al perfil:', navError);
          // Si falla, al menos el usuario verá las felicitaciones en el index
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Error al activar Premium:', error);
      setIsActivatingPremium(false);
      Alert.alert(
        'Pago Procesado',
        'Tu pago fue procesado exitosamente, pero hubo un problema al activar Premium automáticamente. Por favor, contacta a soporte.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
            }
          }
        ]
      );
    }
  };

  // Función para cerrar el modal de felicitaciones
  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
    setCongratulationsData(null);
    console.log('🎊 Usuario confirmó modal de felicitaciones');
    
    // Navegar al perfil cuando el usuario cierre las felicitaciones
    console.log('🧭 Navegando al perfil después de felicitaciones...');
    try {
      router.replace('/(tabs)/profile');
    } catch (navError) {
      console.error('❌ Error en navegación, intentando alternativa:', navError);
      try {
        router.push('/(tabs)/profile');
      } catch (pushError) {
        console.error('❌ Error en navegación alternativa:', pushError);
      }
    }
  };

  // Función para activar la cuenta Premium
  const activatePremiumAccount = async (paymentData: any) => {
    try {
      const token = userInfo?.token;
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      console.log('🔄 Activando cuenta Premium...');
      
      // Llamar al backend para activar Premium
      const response = await fetchWithCORS('https://ct-backend-gray.vercel.app/api/users/premium', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_premium: 2, // Activar premium
          payment_data: paymentData // Incluir datos del pago para auditoría
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al activar premium en el servidor');
      }

      const data = await response.json();

      if (data.success && data.user) {
        console.log('✅ Premium activado en el backend');
        
        // Actualizar el contexto de autenticación
        if (updateProfile) {
          await updateProfile({
            id_premium: data.user.id_premium,
            is_premium: data.user.is_premium
          });
          console.log('✅ Contexto de usuario actualizado');
        }
      } else {
        throw new Error(data.message || 'Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error en activatePremiumAccount:', error);
      throw error;
    }
  };

  // Función para manejar la navegación del WebView
  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('🔄 WebView navegando a:', url);
    
    // Verificar si la URL contiene el return URL de nuestra API (éxito)
    if (url.includes('/webpay/return') || url.includes('/webpay/success') || url.includes('premium/activate')) {
      console.log('✅ Pago completado detectado por URL');
      
      // Extraer parámetros de la URL si están disponibles
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const paymentData = {
        buy_order: urlParams.get('order') || 'N/A',
        amount: parseInt(urlParams.get('amount') || '0'),
        authorization_code: urlParams.get('auth') || 'N/A'
      };
      
      handlePaymentSuccess(paymentData);
      return; // Salir temprano para evitar otras verificaciones
    }
    
    // Verificar si hay errores o cancelación REAL (no confundir con flujo normal)
    // Solo detectar como error si:
    // 1. Hay TBK_TOKEN en la URL de retorno (no en URLs intermedias de Webpay)
    // 2. Hay palabras clave específicas de error
    // 3. Es una URL de nuestro backend con parámetros de error
    const isOurReturnUrl = url.includes('ct-fastapi.vercel.app') || url.includes('localhost:8000');
    const hasErrorToken = url.includes('TBK_TOKEN') && isOurReturnUrl;
    const hasErrorKeywords = url.includes('error=') || url.includes('cancelled=') || url.includes('failed=');
    
    if (hasErrorToken || hasErrorKeywords) {
      console.log('❌ Pago cancelado o con error detectado');
      setShowWebView(false);
      setIsWebViewLoading(true);
      
      Alert.alert(
        'Pago Cancelado',
        'El pago fue cancelado o no se pudo procesar. No se realizaron cargos.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Mantener el modal abierto para permitir reintentar
            }
          }
        ]
      );
    }
    
    // Log para debugging - mostrar URLs de Webpay sin tratarlas como errores
    if (url.includes('webpay3gint.transbank.cl') || url.includes('transbank.cl')) {
      console.log('🔄 Navegando por Webpay (normal):', url.split('?')[0]);
    }
  };

  // Función para cerrar el WebView
  const handleCloseWebView = () => {
    Alert.alert(
      'Cancelar Pago',
      '¿Estás seguro de que quieres cancelar el pago?',
      [
        {
          text: 'Continuar Pagando',
          style: 'cancel'
        },
        {
          text: 'Cancelar Pago',
          style: 'destructive',
          onPress: () => {
            setShowWebView(false);
            setIsWebViewLoading(true);
          }
        }
      ]
    );
  };

  return (
    <>
      {/* Modal principal de Premium */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible && !showWebView && !isActivatingPremium}
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
                {isLoadingPrice ? (
                  <View style={styles.priceLoadingContainer}>
                    <ActivityIndicator size="small" color="#27ae60" />
                    <Text style={styles.priceLoadingText}>Cargando precio...</Text>
                  </View>
                ) : (
                  <Text style={styles.priceText}>{priceDisplay}</Text>
                )}
                <Text style={styles.priceSubtext}>Pago único - Acceso de por vida</Text>
              </View>
            </View>
            
            {/* Botones de acción */}
            <View style={styles.premiumModalButtons}>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  (isProcessingPayment || isLoadingPrice) && styles.disabledButton
                ]}
                onPress={handlePremiumUpgrade}
                disabled={isProcessingPayment || isLoadingPrice}
              >
                {isProcessingPayment ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.upgradeButtonText}>
                      Procesando...
                    </Text>
                  </>
                ) : isLoadingPrice ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.upgradeButtonText}>
                      Cargando...
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

      {/* Modal del WebView para el pago */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showWebView}
        onRequestClose={handleCloseWebView}
      >
        <View style={styles.webViewContainer}>
          {/* Header del WebView */}
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              style={styles.webViewCloseButton}
              onPress={handleCloseWebView}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Pago Seguro - Webpay Plus</Text>
            <View style={styles.webViewSecurityIndicator}>
              <Ionicons name="shield-checkmark" size={20} color="#27ae60" />
            </View>
            
            {/* Botón de prueba solo en web */}
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => {
                  console.log('🧪 Simulando pago exitoso para pruebas...');
                  handlePaymentSuccess({
                    buy_order: currentBuyOrder,
                    amount: 10000,
                    authorization_code: 'TEST_' + Date.now(),
                    transaction_date: new Date().toISOString()
                  });
                }}
              >
                <Text style={styles.testButtonText}>✓ Simular Éxito</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Indicador de carga */}
          {isWebViewLoading && (
            <View style={styles.webViewLoadingContainer}>
              <ActivityIndicator size="large" color="#27ae60" />
              <Text style={styles.webViewLoadingText}>
                Cargando sistema de pago seguro...
              </Text>
            </View>
          )}

          {/* WebView o iframe dependiendo de la plataforma */}
          {webViewUrl && (
            Platform.OS === 'web' ? (
              <iframe
                src={webViewUrl}
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#fff'
                }}
                onLoad={() => {
                  setIsWebViewLoading(false);
                  console.log('🌐 Iframe cargado en web');
                }}
                title="Webpay Plus - Pago Seguro"
              />
            ) : (
              <WebView
                source={{ uri: webViewUrl }}
                style={styles.webView}
                onLoadStart={() => setIsWebViewLoading(true)}
                onLoadEnd={() => setIsWebViewLoading(false)}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('❌ Error en WebView:', nativeEvent);
                  Alert.alert(
                    'Error de Conexión',
                    'No se pudo cargar el sistema de pago. Verifica tu conexión a internet.',
                    [
                      {
                        text: 'Reintentar',
                        onPress: () => {
                          setIsWebViewLoading(true);
                        }
                      },
                      {
                        text: 'Cancelar',
                        onPress: handleCloseWebView
                      }
                    ]
                  );
                }}
              />
            )
          )}
        </View>
      </Modal>

      {/* Modal de Activando Premium */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isActivatingPremium}
        onRequestClose={() => {}} // No permitir cerrar
      >
        <View style={styles.modalOverlay}>
          <View style={styles.activatingContainer}>
            <ActivityIndicator size="large" color="#27ae60" />
            <Text style={styles.activatingTitle}>¡Pago Exitoso!</Text>
            <Text style={styles.activatingText}>
              Activando tu cuenta Premium...
            </Text>
            <Text style={styles.activatingSubtext}>
              Por favor espera un momento
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal de Felicitaciones */}
      <CongratulationsModal
        visible={showCongratulations}
        onClose={handleCloseCongratulations}
        paymentData={congratulationsData}
      />
    </>
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
  // Estilos para el WebView
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27ae60',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 15,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  webViewCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  webViewSecurityIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  webViewLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#27ae60',
    textAlign: 'center',
  },
  webView: {
    flex: 1,
  },
  // Estilos para el modal de activación
  activatingContainer: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 280,
  },
  activatingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  activatingText: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  activatingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  // Estilos para el indicador de carga del precio
  priceLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  priceLoadingText: {
    fontSize: 16,
    color: '#27ae60',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Estilos para el botón de prueba en web
  testButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PremiumUpgradeModal; 