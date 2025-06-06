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
        setCongratulationsData(pendingActivation);
        setShowCongratulations(true);
      }
    };

    if (!loading) {
      
      // Verificar activación Premium primero
      checkPremiumActivation();
      
      if (currentUser) {
        // Delay la navegación si hay felicitaciones que mostrar
        setTimeout(() => {
          if (!showCongratulations) {
            router.replace('/(tabs)');
          }
        }, 100);
      } else {
        router.replace('/login');
      }
    }
  }, [currentUser, loading, router, showCongratulations]);

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
    setCongratulationsData(null);
    
    // Navegar a tabs después de cerrar felicitaciones
    if (currentUser) {
      router.replace('/(tabs)/profile');
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