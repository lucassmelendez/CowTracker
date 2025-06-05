import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const { width, height } = Dimensions.get('window');

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false,
}) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'confirm':
        return 'help-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'confirm':
        return '#2196F3';
      default:
        return '#2196F3';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
      onClose(); // Cerrar el modal después de ejecutar el callback
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIconName()}
              size={48}
              color={getIconColor()}
            />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: getIconColor() },
                showCancel && styles.confirmButtonWithCancel
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: Math.min(width - 40, 320),
    maxHeight: height * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  confirmButtonWithCancel: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});

// Hook personalizado para usar el modal
export const useCustomModal = () => {
  const [modalState, setModalState] = React.useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as CustomModalProps['type'],
    onConfirm: undefined as (() => void) | undefined,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false,
  });

  const showModal = (config: {
    title: string;
    message: string;
    type?: CustomModalProps['type'];
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }) => {
    setModalState({
      visible: true,
      title: config.title,
      message: config.message,
      type: config.type || 'info',
      onConfirm: config.onConfirm,
      confirmText: config.confirmText || 'Aceptar',
      cancelText: config.cancelText || 'Cancelar',
      showCancel: config.showCancel || false,
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
    showModal({ title, message, type: 'success', onConfirm });
  };

  const showError = (title: string, message: string, onConfirm?: () => void) => {
    showModal({ title, message, type: 'error', onConfirm });
  };

  const showWarning = (title: string, message: string, onConfirm?: () => void) => {
    showModal({ title, message, type: 'warning', onConfirm });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ) => {
    showModal({
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText,
      cancelText,
      showCancel: true,
    });
  };

  const ModalComponent = () => (
    <CustomModal
      visible={modalState.visible}
      title={modalState.title}
      message={modalState.message}
      type={modalState.type}
      onClose={hideModal}
      onConfirm={modalState.onConfirm}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      showCancel={modalState.showCancel}
    />
  );

  return {
    showModal,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    hideModal,
    ModalComponent,
  };
}; 