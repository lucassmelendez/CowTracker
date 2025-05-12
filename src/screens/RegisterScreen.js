import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { registerStyles } from '../styles/registerStyles';

const RegisterScreen = () => {
  const router = useRouter();
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin'); 
  const [localError, setLocalError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { register, isLoading, error } = useAuth();

  const roles = [
    { label: 'Ganadero', value: 'admin' },
    { label: 'Trabajador', value: 'trabajador' },
    { label: 'Veterinario', value: 'veterinario' }
  ];

  const getRoleLabel = (value) => {
    const selectedRole = roles.find(r => r.value === value);
    return selectedRole ? selectedRole.label : 'Ganadero';
  };

  const handleRegister = () => {
    if (!primerNombre || !primerApellido || !email || !password || !confirmPassword) {
      setLocalError('Por favor complete los campos obligatorios (primer nombre, primer apellido, email y contraseña)');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLocalError('');
    
    // Enviar directamente los datos sin crear un objeto intermedio
    console.log('RegisterScreen - Enviando datos directamente:', {
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      email,
      role
    });
    
    // Pasar los datos directamente para evitar conversiones innecesarias
    register({
      primer_nombre: primerNombre,
      segundo_nombre: segundoNombre || "",
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido || "",
      email,
      password,
      role
    });
  };

  const navigateToLogin = () => {
    console.log('Navegando a login');
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={registerStyles.container}
    >
      <ScrollView contentContainerStyle={registerStyles.scrollView}>
        <View style={registerStyles.headerContainer}>
          <Text style={registerStyles.headerTitle}>Crear Cuenta</Text>
          <Text style={registerStyles.headerSubtitle}>Registrate para comenzar a gestionar tu ganado</Text>
        </View>

        <View style={registerStyles.formContainer}>
          <Text style={registerStyles.label}>Primer Nombre *</Text>
          <TextInput
            style={registerStyles.input}
            placeholder="Ingrese su primer nombre"
            value={primerNombre}
            onChangeText={setPrimerNombre}
          />

          <Text style={registerStyles.label}>Segundo Nombre</Text>
          <TextInput
            style={registerStyles.input}
            placeholder="Ingrese su segundo nombre (opcional)"
            value={segundoNombre}
            onChangeText={setSegundoNombre}
          />

          <Text style={registerStyles.label}>Primer Apellido *</Text>
          <TextInput
            style={registerStyles.input}
            placeholder="Ingrese su primer apellido"
            value={primerApellido}
            onChangeText={setPrimerApellido}
          />

          <Text style={registerStyles.label}>Segundo Apellido</Text>
          <TextInput
            style={registerStyles.input}
            placeholder="Ingrese su segundo apellido (opcional)"
            value={segundoApellido}
            onChangeText={setSegundoApellido}
          />

          <Text style={registerStyles.label}>Email *</Text>
          <TextInput
            style={registerStyles.input}
            placeholder="usuario@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={registerStyles.label}>Contraseña *</Text>
          <TextInput
            style={registerStyles.input}
            placeholder="Ingrese su contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={registerStyles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={registerStyles.input}
            placeholder="Confirme su contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text style={registerStyles.label}>Tipo de Rol *</Text>
          <TouchableOpacity 
            style={registerStyles.selectorButton} 
            onPress={() => setShowRoleModal(true)}
          >
            <Text style={registerStyles.selectorText}>{getRoleLabel(role)}</Text>
          </TouchableOpacity>

          {(localError || error) && <Text style={registerStyles.errorText}>{localError || error}</Text>}

          <TouchableOpacity 
            style={registerStyles.button} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={registerStyles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={registerStyles.loginContainer}>
            <Text style={registerStyles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={registerStyles.loginLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para selección de rol */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={registerStyles.modalOverlay}>
          <View style={registerStyles.modalContent}>
            <Text style={registerStyles.modalTitle}>Seleccione un Rol</Text>
            
            {roles.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  registerStyles.roleItem,
                  role === item.value && registerStyles.roleItemSelected
                ]}
                onPress={() => {
                  setRole(item.value);
                  setShowRoleModal(false);
                }}
              >
                <Text style={[
                  registerStyles.roleItemText,
                  role === item.value && registerStyles.roleItemTextSelected
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={registerStyles.cancelButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={registerStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;