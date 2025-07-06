import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Dimensions,
  ScrollView
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
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: width * 0.92, maxHeight: height * 0.85 }]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header with celebration */}
            <View style={styles.header}>
              <View style={styles.celebrationContainer}>
                <View style={styles.crownContainer}>
                  <Ionicons name="diamond" size={50} color="#FFD700" />
                </View>
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={16} color="#FFD700" style={styles.sparkle1} />
                  <Ionicons name="sparkles" size={20} color="#FFD700" style={styles.sparkle2} />
                  <Ionicons name="sparkles" size={14} color="#FFD700" style={styles.sparkle3} />
                </View>
              </View>
              
              <Text style={styles.title}>¡Felicitaciones!</Text>
              <Text style={styles.subtitle}>¡Ya eres Premium!</Text>
              <Text style={styles.welcomeText}>
                Bienvenido a la experiencia completa de CowTracker
              </Text>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>
                🎉 Ahora tienes acceso a:
              </Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="infinite" size={18} color="#27ae60" />
                  </View>
                  <Text style={styles.benefitText}>Registro ilimitado de ganado</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="analytics" size={18} color="#27ae60" />
                  </View>
                  <Text style={styles.benefitText}>Reportes avanzados y estadísticas</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="download" size={18} color="#27ae60" />
                  </View>
                  <Text style={styles.benefitText}>Exportación a Excel/PDF</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="headset" size={18} color="#27ae60" />
                  </View>
                  <Text style={styles.benefitText}>Soporte prioritario 24/7</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="cloud-upload" size={18} color="#27ae60" />
                  </View>
                  <Text style={styles.benefitText}>Sincronización en la nube</Text>
                </View>
              </View>
            </View>

            {/* Payment Info */}
            {paymentData && (
              <View style={styles.paymentSection}>
                <Text style={styles.sectionTitle}>💳 Detalles del pago</Text>
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Orden:</Text>
                    <Text style={styles.paymentValue}>{paymentData.buy_order}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Monto:</Text>
                    <Text style={styles.paymentValue}>
                      ${paymentData.amount.toLocaleString()} CLP
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Fixed Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="rocket" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>
                ¡Empezar a usar Premium!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle1: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
  sparkle2: {
    position: 'absolute',
    top: 15,
    left: 5,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 10,
    right: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#27ae60',
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
    fontWeight: '500',
  },
  paymentSection: {
    marginBottom: 16,
  },
  paymentInfo: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  paymentValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CongratulationsModal; 