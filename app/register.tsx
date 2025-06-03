import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';

interface Role {
  id: string;
  name: string;
  description: string;
}

const roles: Role[] = [
  { id: 'ganadero', name: 'Ganadero', description: 'Propietario de ganado y granjas' },
  { id: 'trabajador', name: 'Trabajador', description: 'Empleado que maneja el ganado' },
  { id: 'veterinario', name: 'Veterinario', description: 'Profesional de salud animal' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

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

      console.log('Datos a enviar:', userData);

      const result = await register(userData);
      
      if (result.success) {
        Alert.alert(
          'Registro exitoso',
          'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/login'),
            },
          ]
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <Text style={styles.headerSubtitle}>Únete a CowTracker</Text>
        </View>

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu rol</Text>
            
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleItem,
                  formData.role === role.id && styles.roleItemSelected,
                ]}
                onPress={() => handleRoleSelect(role)}
              >
                <Text
                  style={[
                    styles.roleItemText,
                    formData.role === role.id && styles.roleItemTextSelected,
                  ]}
                >
                  {role.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#7f8c8d', textAlign: 'center', marginTop: 2 }}>
                  {role.description}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    marginVertical: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectorButton: {
    backgroundColor: '#f9f9f9',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
  },
  selectorText: {
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#27ae60',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  loginText: {
    color: '#7f8c8d',
  },
  loginLink: {
    color: '#3498db',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  roleItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  roleItemSelected: {
    backgroundColor: '#e8f7f0',
  },
  roleItemText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  roleItemTextSelected: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});