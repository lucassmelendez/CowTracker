import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../src/components/AuthContext';
import RegisterScreen from '../src/screens/RegisterScreen';
import { useState } from 'react';

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 

const [role, setRole] = useState('granjero'); // Default role

<label htmlFor="role">Tipo de Rol:</label>
<select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
  <option value="granjero">Granjero (Admin)</option>
  <option value="trabajador">Trabajador</option>
  <option value="veterinario">Veterinario</option>
</select>

// Include role in the registration data
const registrationData = { email, password, role };