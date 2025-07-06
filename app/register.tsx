import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { createStyles, tw } from '../styles/tailwind';
import { useCustomModal } from '../components/CustomModal';
import SimpleHeader from '../components/SimpleHeader';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const roles: Role[] = [
  { 
    id: 'ganadero', 
    name: 'Ganadero', 
    description: 'Propietario de ganado y granjas',
    icon: '🐄',
    color: '#27ae60'
  },
  { 
    id: 'trabajador', 
    name: 'Trabajador', 
    description: 'Empleado que maneja el ganado',
    icon: '👷',
    color: '#3498db'
  },
  { 
    id: 'veterinario', 
    name: 'Veterinario', 
    description: 'Profesional de salud animal',
    icon: '🩺',
    color: '#e74c3c'
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { showSuccess, ModalComponent } = useCustomModal();

  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Función personalizada para volver al login
  const handleBackToLogin = () => {
    router.push('/login');
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.primer_nombre.trim()) {
      newErrors.push('El primer nombre es obligatorio');
    }

    if (!formData.primer_apellido.trim()) {
      newErrors.push('El primer apellido es obligatorio');
    }

    if (!formData.email.trim()) {
      newErrors.push('El email es obligatorio');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('El email no es válido');
    }

    if (!formData.password) {
      newErrors.push('La contraseña es obligatoria');
    } else if (formData.password.length < 6) {
      newErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Las contraseñas no coinciden');
    }

    if (!formData.role) {
      newErrors.push('Debes seleccionar un rol');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const userData = {
        primer_nombre: formData.primer_nombre.trim(),
        segundo_nombre: formData.segundo_nombre.trim(),
        primer_apellido: formData.primer_apellido.trim(),
        segundo_apellido: formData.segundo_apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      const result = await register(userData);
      
      if (result.success) {
        showSuccess(
          'success',
          'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
          () => router.push('/login')
        );
      } else {
        setErrors([result.message || 'Error en el registro']);
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      setErrors([error.message || 'Error al crear la cuenta']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setFormData({ ...formData, role: role.id });
    setShowRoleModal(false);
  };

  const getSelectedRoleName = () => {
    const selectedRole = roles.find(role => role.id === formData.role);
    return selectedRole ? selectedRole.name : 'Seleccionar rol';
  };

  const getSelectedRoleIcon = () => {
    const selectedRole = roles.find(role => role.id === formData.role);
    return selectedRole ? selectedRole.icon : '👤';
  };

  const styles = {
    container: createStyles(tw.container),
    scrollView: createStyles(tw.scrollContainer),
    headerContainer: createStyles('mb-8'),
    headerTitle: createStyles(tw.title),
    headerSubtitle: createStyles(tw.subtitle),
    formContainer: createStyles(tw.formContainer),
    label: createStyles(tw.label),
    input: createStyles(tw.input),
    selectorButton: createStyles(`${tw.input} flex-row items-center`),
    selectorText: createStyles('text-gray-800 text-base'),
    selectorIcon: createStyles('text-lg mr-2'),
    button: createStyles(tw.primaryButton),
    buttonText: createStyles(tw.primaryButtonText),
    errorText: createStyles(tw.errorText),
    loginContainer: createStyles('flex-row justify-center mt-4'),
    loginText: createStyles('text-gray-600'),
    loginLink: createStyles('text-blue-500 font-semibold'),
    // Estilos del modal similares al PremiumUpgradeModal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    roleModalContent: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
    },
    roleModalHeader: {
      backgroundColor: '#27ae60',
      paddingVertical: 30,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    roleIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    roleModalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 8,
      textAlign: 'center',
    },
    roleModalSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    roleModalBody: {
      padding: 24,
    },
    roleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#ecf0f1',
      backgroundColor: '#fff',
    },
    roleItemSelected: {
      borderColor: '#27ae60',
      backgroundColor: '#e8f5e8',
    },
    roleIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    roleTextContainer: {
      flex: 1,
    },
    roleItemText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 4,
    },
    roleItemTextSelected: {
      color: '#27ae60',
    },
    roleDescription: {
      fontSize: 14,
      color: '#7f8c8d',
      lineHeight: 20,
    },
    roleModalButtons: {
      padding: 24,
      paddingTop: 0,
    },
    cancelButton: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#bdc3c7',
      backgroundColor: '#fff',
    },
    cancelButtonText: {
      textAlign: 'center' as const,
      fontSize: 16,
      fontWeight: '500' as const,
      color: '#7f8c8d',
    },
  };

  return (
    <View style={styles.container}>
      {/* Header simple con botón de volver */}
      <SimpleHeader title="Crear Cuenta" onBackPress={handleBackToLogin} />
      
      <ScrollView contentContainerStyle={styles.scrollView}>


        <View style={styles.formContainer}>
          <Text style={styles.label}>Primer Nombre *</Text>
          <TextInput
            style={styles.input}
            value={formData.primer_nombre}
            onChangeText={(text) => setFormData({ ...formData, primer_nombre: text })}
            placeholder="Ingresa tu primer nombre"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Segundo Nombre</Text>
          <TextInput
            style={styles.input}
            value={formData.segundo_nombre}
            onChangeText={(text) => setFormData({ ...formData, segundo_nombre: text })}
            placeholder="Ingresa tu segundo nombre (opcional)"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Primer Apellido *</Text>
          <TextInput
            style={styles.input}
            value={formData.primer_apellido}
            onChangeText={(text) => setFormData({ ...formData, primer_apellido: text })}
            placeholder="Ingresa tu primer apellido"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Segundo Apellido</Text>
          <TextInput
            style={styles.input}
            value={formData.segundo_apellido}
            onChangeText={(text) => setFormData({ ...formData, segundo_apellido: text })}
            placeholder="Ingresa tu segundo apellido (opcional)"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="Repite tu contraseña"
            secureTextEntry
          />

          <Text style={styles.label}>Rol *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowRoleModal(true)}
          >
            <Text style={styles.selectorIcon}>{getSelectedRoleIcon()}</Text>
            <Text style={styles.selectorText}>{getSelectedRoleName()}</Text>
          </TouchableOpacity>

          {errors.length > 0 && (
            <View>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  {error}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de selección de rol */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.roleModalContent}>
            {/* Header con gradiente */}
            <View style={modalStyles.roleModalHeader}>
              <Text style={modalStyles.roleModalTitle}>
                Selecciona tu rol
              </Text>
            </View>
            
            {/* Contenido principal */}
            <View style={modalStyles.roleModalBody}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    modalStyles.roleItem,
                    formData.role === role.id && modalStyles.roleItemSelected,
                  ]}
                  onPress={() => handleRoleSelect(role)}
                >
                  <Text style={modalStyles.roleIcon}>{role.icon}</Text>
                  <View style={modalStyles.roleTextContainer}>
                    <Text
                      style={[
                        modalStyles.roleItemText,
                        formData.role === role.id && modalStyles.roleItemTextSelected,
                      ]}
                    >
                      {role.name}
                    </Text>
                    <Text style={modalStyles.roleDescription}>
                      {role.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botones de acción */}
            <View style={modalStyles.roleModalButtons}>
              <TouchableOpacity
                style={modalStyles.cancelButton}
                onPress={() => setShowRoleModal(false)}
              >
                <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ModalComponent />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  roleModalHeader: {
    backgroundColor: '#27ae60',
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleModalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  roleModalBody: {
    padding: 24,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    backgroundColor: '#fff',
  },
  roleItemSelected: {
    borderColor: '#27ae60',
    backgroundColor: '#e8f5e8',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  roleItemTextSelected: {
    color: '#27ae60',
  },
  roleDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  roleModalButtons: {
    padding: 24,
    paddingTop: 0,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});