import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/services/api';
import { supabase } from '../../lib/config/supabase';
import PremiumUpgradeModal from '../../components/PremiumUpgradeModal';

interface UserData {
  email: string;
  role: string;
  roleDisplay: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  id_premium: number;
  premium_type: string;
  password?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const { currentUser, userInfo, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    role: '',
    roleDisplay: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    id_premium: 1,
    premium_type: 'Free'
  });
  const [formData, setFormData] = useState<UserData>({...userData});

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        // Obtener datos del usuario desde la API
        const userResponse = await api.users.getProfile();
        const userData = userResponse || userResponse;
        
        if (userData) {
          const processedData: UserData = {
            email: userData.email || '',
            role: userData.rol?.nombre_rol || '',
            roleDisplay: userData.rol?.nombre_rol === 'admin' ? 'Ganadero' : 
                       userData.rol?.nombre_rol === 'trabajador' ? 'Trabajador' : 
                       userData.rol?.nombre_rol === 'veterinario' ? 'Veterinario' : userData.rol?.nombre_rol || '',
            primer_nombre: userData.primer_nombre || '',
            segundo_nombre: userData.segundo_nombre || '',
            primer_apellido: userData.primer_apellido || '',
            segundo_apellido: userData.segundo_apellido || '',
            id_premium: userData.id_premium || 1,
            premium_type: userData.premium_type || 'Free'
          };
          
          setUserData(processedData);
          setFormData(processedData);
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        // Si falla, usar datos del contexto
        if (userInfo) {
          const fallbackData: UserData = {
            email: userInfo.email || currentUser?.email || '',
            role: userInfo.rol?.nombre_rol || '',
            roleDisplay: userInfo.rol?.nombre_rol === 'admin' ? 'Administrador' : 
                  userInfo.rol?.nombre_rol === 'veterinario' ? 'Veterinario' :
                  userInfo.rol?.nombre_rol === 'user' || userInfo.rol?.nombre_rol === 'trabajador' ? 'Trabajador' : 'Usuario',
            primer_nombre: userInfo.primer_nombre || '',
            segundo_nombre: userInfo.segundo_nombre || '',
            primer_apellido: userInfo.primer_apellido || '',
            segundo_apellido: userInfo.segundo_apellido || '',
            id_premium: userInfo.id_rol || 1,
            premium_type: userInfo.id_rol === 2 ? 'Premium' : 'Free'
          };
          setUserData(fallbackData);
          setFormData(fallbackData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [currentUser, userInfo]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({...userData});
  };

  const handleSave = async () => {
    try {
      if (formData.password && formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }

      // Enviar los campos separados directamente
      const updateData: any = {
        email: formData.email,
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        id_premium: formData.id_premium,
        ...(formData.password ? { password: formData.password } : {})
      };

      setIsLoading(true);
      // Usar la función correcta del contexto de autenticación
      await updateProfile(updateData);
      
      // Actualizar los datos locales con los mismos valores
      setUserData({
        ...userData,
        email: formData.email,
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        id_premium: formData.id_premium
      });
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({...userData});
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          onPress: () => {
            logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getInitials = () => {
    const primerNombre = userData.primer_nombre || '';
    const primerApellido = userData.primer_apellido || '';
    
    if (!primerNombre && !primerApellido) return '?';
    
    const inicialNombre = primerNombre ? primerNombre.charAt(0) : '';
    const inicialApellido = primerApellido ? primerApellido.charAt(0) : '';
    
    return (inicialNombre + inicialApellido).toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={{ marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Gestiona tu información personal</Text>
      </View>
      
      <ScrollView>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <Text style={styles.role}>{userData.roleDisplay}</Text>
          </View>
          
          <View style={styles.infoContainer}>
            {isEditing ? (
              <>
                <Text style={styles.label}>Primer nombre</Text>
                <TextInput
                  style={styles.input}
                  value={formData.primer_nombre}
                  onChangeText={(text) => setFormData({...formData, primer_nombre: text})}
                  placeholder="Primer nombre"
                />
                
                <Text style={styles.label}>Segundo nombre</Text>
                <TextInput
                  style={styles.input}
                  value={formData.segundo_nombre}
                  onChangeText={(text) => setFormData({...formData, segundo_nombre: text})}
                  placeholder="Segundo nombre (opcional)"
                />
                
                <Text style={styles.label}>Primer apellido</Text>
                <TextInput
                  style={styles.input}
                  value={formData.primer_apellido}
                  onChangeText={(text) => setFormData({...formData, primer_apellido: text})}
                  placeholder="Primer apellido"
                />
                
                <Text style={styles.label}>Segundo apellido</Text>
                <TextInput
                  style={styles.input}
                  value={formData.segundo_apellido}
                  onChangeText={(text) => setFormData({...formData, segundo_apellido: text})}
                  placeholder="Segundo apellido (opcional)"
                />    

                <Text style={styles.label}>Suscripción</Text>
                <TextInput
                  style={styles.input}
                  value={formData.premium_type || (formData.id_premium === 2 ? 'Premium' : 'Free')}
                  editable={false}
                />

              </>
            ) : (
              <>
                <Text style={styles.label}>Primer nombre</Text>
                <Text style={styles.infoText}>{userData.primer_nombre || 'No especificado'}</Text>
                
                <Text style={styles.label}>Segundo nombre</Text>
                <Text style={styles.infoText}>{userData.segundo_nombre || 'No especificado'}</Text>
                
                <Text style={styles.label}>Primer apellido</Text>
                <Text style={styles.infoText}>{userData.primer_apellido || 'No especificado'}</Text>
                
                <Text style={styles.label}>Segundo apellido</Text>
                <Text style={styles.infoText}>{userData.segundo_apellido || 'No especificado'}</Text>

                <Text style={styles.label}>Suscripción</Text>
                <Text style={styles.infoText}>
                  {userData.premium_type || (userData.id_premium === 2 ? 'Premium' : 'Free')}
                </Text>
                
                {userData.id_premium !== 2 && (
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: '#27ae60', marginTop: 10 }]}
                    onPress={() => setShowPremiumModal(true)}
                  >
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                      Actualizar a Premium
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            
            <Text style={styles.label}>Correo electrónico</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Correo electrónico"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoText}>{userData.email}</Text>
            )}
            
            {isEditing && (
              <>
                <Text style={styles.label}>Nueva contraseña (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password || ''}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  placeholder="Nueva contraseña"
                  secureTextEntry
                />
                
                <Text style={styles.label}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword || ''}
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                  placeholder="Confirmar contraseña"
                  secureTextEntry
                />
              </>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Guardar cambios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.buttonText}>Editar perfil</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <PremiumUpgradeModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="¡Actualiza tu cuenta a Premium!"
        subtitle="Desbloquea todas las funcionalidades de CowTracker"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  role: {
    fontSize: 16,
    color: '#777777',
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
}); 