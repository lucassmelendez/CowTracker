import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CongratulationsModalProps {
  visible: boolean;
  onClose: () => void;
  paymentData?: {
    buy_order: string;
    amount: number;
    authorization_code: string;
  };
}

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ 
  visible, 
  onClose, 
  paymentData 
}) => {
  const { width } = Dimensions.get('window');

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: width * 0.9 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.crownContainer}>
              <Ionicons name="diamond" size={60} color="#FFD700" />
            </View>
            <Text style={styles.title}>¡Felicitaciones!</Text>
            <Text style={styles.subtitle}>¡Ya eres Premium!</Text>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>
              Ahora tienes acceso a:
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="infinite" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Registro ilimitado de ganado</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="analytics" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Reportes avanzados y estadísticas</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="download" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Exportación a Excel/PDF</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="headset" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Soporte prioritario 24/7</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="cloud-upload" size={20} color="#27ae60" />
                <Text style={styles.benefitText}>Sincronización en la nube</Text>
              </View>
            </View>
          </View>

          {/* Payment Info */}
          {paymentData && (
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Detalles del pago:</Text>
              <Text style={styles.paymentDetail}>
                📋 Orden: {paymentData.buy_order}
              </Text>
              <Text style={styles.paymentDetail}>
                💰 Monto: ${paymentData.amount.toLocaleString()} CLP
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onClose}
          >
            <Ionicons name="rocket" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>
              ¡Empezar a usar Premium!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  crownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#27ae60',
    fontWeight: '600',
    textAlign: 'center',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 25,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  benefitText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#34495e',
    flex: 1,
    fontWeight: '500',
  },
  paymentInfo: {
    width: '100%',
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentDetail: {
    fontSize: 13,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 15,
    minWidth: 250,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CongratulationsModal; 