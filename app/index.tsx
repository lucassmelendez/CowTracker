import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import CongratulationsModal from '../components/CongratulationsModal';
import { PremiumNotificationService } from '../lib/services/premiumNotifications';

export default function Index() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [congratulationsData, setCongratulationsData] = useState<any>(null);
  
  useEffect(() => {
    const checkPremiumActivation = async () => {
      // Verificar si hay una activación Premium pendiente
      const pendingActivation = await PremiumNotificationService.getPendingActivation();
      if (pendingActivation) {
        console.log('🎊 Activación Premium detectada en index:', pendingActivation);
        setCongratulationsData(pendingActivation);
        setShowCongratulations(true);
      }
    };

    if (!loading) {
      console.log('Index: Estado de autenticación:', !!currentUser);
      
      // Verificar activación Premium primero
      checkPremiumActivation();
      
      if (currentUser) {
        console.log('Navegando a tabs desde index...');
        // Delay la navegación si hay felicitaciones que mostrar
        setTimeout(() => {
          if (!showCongratulations) {
            router.replace('/(tabs)');
          }
        }, 100);
      } else {
        console.log('Navegando a login desde index...');
        router.replace('/login');
      }
    }
  }, [currentUser, loading, router, showCongratulations]);

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
    setCongratulationsData(null);
    console.log('🎊 Felicitaciones cerradas, navegando a tabs...');
    
    // Navegar a tabs después de cerrar felicitaciones
    if (currentUser) {
      router.replace('/(tabs)/profile'); // Ir directamente al perfil
    } else {
      router.replace('/(tabs)');
    }
  };
  
  // Mostrar loading mientras se verifica la autenticación o se navega
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#27ae60" />
      
      {/* Modal de Felicitaciones */}
      <CongratulationsModal
        visible={showCongratulations}
        onClose={handleCloseCongratulations}
        paymentData={congratulationsData}
      />
    </View>
  );
}