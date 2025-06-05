import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/services/api';
import { supabase } from '../../lib/config/supabase';
import PremiumUpgradeModal from '../../components/PremiumUpgradeModal';
import { useUserProfile, useCacheManager } from '../../hooks/useCachedData';
import cachedApi from '../../lib/services/cachedApi';
import { createStyles, tw } from '../../styles/tailwind';

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
  const { invalidateCache } = useCacheManager();
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

  // Hook de caché para el perfil del usuario
  const { 
    data: cachedUserProfile, 
    loading: profileLoading, 
    error: profileError,
    refresh: refreshProfile 
  } = useUserProfile();

  const styles = {
    container: createStyles(tw.container),
    header: createStyles(`${tw.header} p-5 pt-10`),
    title: createStyles('text-2xl font-bold text-white'),
    subtitle: createStyles('text-base text-white opacity-80 mt-1'),
    card: createStyles('bg-white m-5 rounded-lg p-5'),
    avatarContainer: createStyles('items-center mb-5'),
    avatar: createStyles('w-20 h-20 rounded-full bg-green-600 justify-center items-center mb-2'),
    avatarText: createStyles('text-2xl font-bold text-white'),
    role: createStyles('text-base text-gray-600 font-semibold'),
    infoContainer: createStyles('mb-5'),
    label: createStyles(tw.label + ' mt-2'),
    infoText: createStyles('text-base text-gray-600 mb-2 py-2 px-3 bg-gray-50 rounded-lg'),
    input: createStyles(tw.input),
    buttonContainer: createStyles('gap-4'),
    button: createStyles('py-3 px-5 rounded-lg items-center'),
    editButton: createStyles(tw.primaryButton + ' py-3 px-5'),
    saveButton: createStyles(tw.primaryButton + ' py-3 px-5'),
    cancelButton: createStyles('bg-gray-100 py-3 px-5 rounded-lg items-center border border-gray-300'),
    logoutButton: createStyles('bg-red-500 py-3 px-5 rounded-lg items-center mt-4'),
    buttonText: createStyles('text-white text-base font-semibold'),
    cancelText: createStyles('text-gray-800 text-base font-semibold'),
    loadingContainer: createStyles(tw.loadingContainer),
    premiumBadge: createStyles('bg-yellow-500 px-2 py-1 rounded-full'),
    premiumText: createStyles('text-white text-xs font-bold'),
    upgradeButton: createStyles('bg-yellow-500 py-2 px-4 rounded-lg mt-2'),
    upgradeButtonText: createStyles('text-white text-sm font-semibold'),
  };

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Usar datos del caché si están disponibles
        let userData = cachedUserProfile;
        
        // Si no hay datos en caché, intentar cargar desde la API
        if (!userData) {
          try {
            userData = await cachedApi.getUserProfile();
          } catch (error) {
            console.error('Error al cargar perfil desde caché:', error);
            // Fallback a la API directa
            userData = await api.users.getProfile();
          }
        }
        
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
  }, [cachedUserProfile, currentUser, userInfo]);

  // Actualizar estado de carga basado en el hook de caché
  useEffect(() => {
    setIsLoading(profileLoading);
  }, [profileLoading]);

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
      
      // Invalidar caché de usuarios para refrescar los datos
      await invalidateCache('users');
      await refreshProfile();
      
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
    const firstName = userData.primer_nombre || '';
    const lastName = userData.primer_apellido || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tw.colors.primary} />
        <Text style={styles.subtitle}>Cargando perfil...</Text>
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
            <View style={createStyles('flex-row items-center')}>
              <Text style={styles.role}>{userData.roleDisplay}</Text>
              {userData.id_premium === 2 && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              )}
            </View>
            {userData.id_premium === 1 && (
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => setShowPremiumModal(true)}
              >
                <Text style={styles.upgradeButtonText}>Actualizar a Premium</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Primer nombre</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.primer_nombre}
                onChangeText={(text) => setFormData({...formData, primer_nombre: text})}
                placeholder="Primer nombre"
              />
            ) : (
              <Text style={styles.infoText}>{userData.primer_nombre}</Text>
            )}
            
            <Text style={styles.label}>Segundo nombre</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.segundo_nombre}
                onChangeText={(text) => setFormData({...formData, segundo_nombre: text})}
                placeholder="Segundo nombre (opcional)"
              />
            ) : (
              <Text style={styles.infoText}>{userData.segundo_nombre || 'No especificado'}</Text>
            )}
            
            <Text style={styles.label}>Primer apellido</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.primer_apellido}
                onChangeText={(text) => setFormData({...formData, primer_apellido: text})}
                placeholder="Primer apellido"
              />
            ) : (
              <Text style={styles.infoText}>{userData.primer_apellido}</Text>
            )}
            
            <Text style={styles.label}>Segundo apellido</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.segundo_apellido}
                onChangeText={(text) => setFormData({...formData, segundo_apellido: text})}
                placeholder="Segundo apellido (opcional)"
              />
            ) : (
              <Text style={styles.infoText}>{userData.segundo_apellido || 'No especificado'}</Text>
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