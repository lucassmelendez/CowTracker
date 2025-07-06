import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthContext';

export default function PremiumActivateScreen() {
  const { order, amount, auth } = useLocalSearchParams();
  const router = useRouter();
  const { userInfo, updateProfile } = useAuth();
  
  const [isActivating, setIsActivating] = useState(true);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order && amount && auth && userInfo) {
      activatePremium();
    } else {
      setError('Información de pago incompleta');
      setIsActivating(false);
    }
  }, [order, amount, auth, userInfo]);

  const activatePremium = async () => {
    try {
      setIsActivating(true);
      setError(null);

      const token = userInfo?.token;
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      if (updateProfile && userInfo) {
        try {
          const currentData = {
            primer_nombre: userInfo.primer_nombre,
            segundo_nombre: userInfo.segundo_nombre,
            primer_apellido: userInfo.primer_apellido,
            segundo_apellido: userInfo.segundo_apellido,
            email: userInfo.email,
            id_premium: 2
          };
          await updateProfile(currentData);
        } catch (updateError) {
          console.warn('⚠️ Error al actualizar perfil en contexto:', updateError);
          throw updateError;
        }
      } else {
        throw new Error('updateProfile o userInfo no están disponibles');
      }
        
        setActivationSuccess(true);
        setIsActivating(false);
        
        setTimeout(() => {
          router.replace('/(tabs)/profile');
        }, 2000);
    } catch (error: any) {
      console.error('❌ Error al activar premium:', error);
      setError(error.message || 'Error al activar premium');
      setIsActivating(false);
    }
  };

  if (isActivating) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.iconContainer}>💎</Text>
          <Text style={styles.loader}>⏳</Text>
          <Text style={styles.loadingTitle}>Activando Premium...</Text>
          <Text style={styles.loadingSubtitle}>
            Estamos procesando tu pago y activando tu cuenta Premium
          </Text>
          
          {order && (
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentInfoTitle}>Información del Pago:</Text>
              <Text style={styles.paymentInfoText}>Orden: {order}</Text>
              <Text style={styles.paymentInfoText}>Monto: ${parseInt(amount as string || '0').toLocaleString()} CLP</Text>
              <Text style={styles.paymentInfoText}>Autorización: {auth}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  if (activationSuccess) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIconContainer}>✅</Text>
          
          <Text style={styles.successTitle}>¡Premium Activado! 🎉</Text>
          <Text style={styles.successSubtitle}>
            ¡Felicitaciones! Tu cuenta Premium ha sido activada exitosamente.
          </Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Funcionalidades Premium Activadas:</Text>
            
            <View style={styles.benefitItem}>
              <Text>✅</Text>
              <Text style={styles.benefitText}>Registro ilimitado de ganado</Text>
            </View>

            <View style={styles.benefitItem}>
              <Text>✅</Text>
              <Text style={styles.benefitText}>Registro ilimitado de Granjas</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text>✅</Text>
              <Text style={styles.benefitText}>Soporte prioritario 24/7</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text>✅</Text>
              <Text style={styles.benefitText}>Sincronización en la nube</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.replace('/(tabs)/profile')}
          >
            <Text style={styles.continueButtonText}>Ir a Mi Perfil</Text>
          </TouchableOpacity>
          
          <Text style={styles.redirectMessage}>
            Serás redirigido automáticamente en unos segundos...
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Error de Activación</Text>
        <Text style={styles.errorMessage}>
          {error || 'No se pudo activar tu cuenta Premium'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => activatePremium()}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.buttonText}>Ir al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 40,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    fontSize: 60,
    marginBottom: 20,
  },
  loader: {
    fontSize: 30,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  paymentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  paymentInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginVertical: 2,
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 40,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  successIconContainer: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  redirectMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 40,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  homeButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 