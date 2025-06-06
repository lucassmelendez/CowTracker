import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/services/api';
import { supabase } from '../../lib/config/supabase';
import PremiumUpgradeModal from '../../components/PremiumUpgradeModal';
import { useUserProfile, useCacheManager } from '../../hooks/useCachedData';
import cachedApi from '../../lib/services/cachedApi';
import { createStyles, tw } from '../../styles/tailwind';
import CongratulationsModal from '../../components/CongratulationsModal';
import { PremiumNotificationService } from '../../lib/services/premiumNotifications';
import { useCustomModal } from '../../components/CustomModal';

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
  
  // Hook para modales personalizados
  const { showSuccess, showError, showConfirm, ModalComponent } = useCustomModal();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [congratulationsData, setCongratulationsData] = useState<any>(null);
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
    deleteAccountButton: {
      backgroundColor: '#b91c1c',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center' as const,
      marginTop: 8,
      borderWidth: 2,
      borderColor: '#991b1b',
    },
    separator: {
      height: 1,
      backgroundColor: '#e5e7eb',
      marginVertical: 16,
      marginHorizontal: 20,
    },
    buttonText: createStyles('text-white text-base font-semibold'),
    cancelText: createStyles('text-gray-800 text-base font-semibold'),
    loadingContainer: createStyles(tw.loadingContainer),
    premiumBadge: createStyles('bg-yellow-500 px-2 py-1 rounded-full'),
    premiumText: createStyles('text-white text-xs font-bold'),
    workerBadge: createStyles('bg-blue-500 px-2 py-1 rounded-full'),
    workerText: createStyles('text-white text-xs font-bold'),
    veterinaryBadge: createStyles('bg-green-600 px-2 py-1 rounded-full'),
    veterinaryText: createStyles('text-white text-xs font-bold'),
    adminBadge: {
      backgroundColor: '#dc2626',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
    },
    adminText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    upgradeButton: createStyles('bg-yellow-500 py-2 px-4 rounded-lg mt-2'),
    upgradeButtonText: createStyles('text-white text-sm font-semibold'),
    helperText: createStyles('text-sm text-gray-600 text-center mt-2'),
  };

  // Verificar felicitaciones Premium al cargar
  useEffect(() => {
    const checkPremiumActivation = async () => {
      const pendingActivation = await PremiumNotificationService.getPendingActivation();
      if (pendingActivation) {
        setCongratulationsData(pendingActivation);
        setShowCongratulations(true);
      }
    };

    checkPremiumActivation();
  }, []);

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
            role: userData.id_rol?.toString() || '',
            roleDisplay: userData.id_rol === 1 ? 'Admin' : 
                       userData.id_rol === 2 ? 'Trabajador' : 
                       userData.id_rol === 3 ? 'Veterinario' : 'Usuario',
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
            role: userInfo.id_rol?.toString() || '',
            roleDisplay: userInfo.id_rol === 1 ? 'Admin' : 
                  userInfo.id_rol === 2 ? 'Trabajador' :
                  userInfo.id_rol === 3 ? 'Veterinario' : 'Usuario',
            primer_nombre: userInfo.primer_nombre || '',
            segundo_nombre: userInfo.segundo_nombre || '',
            primer_apellido: userInfo.primer_apellido || '',
            segundo_apellido: userInfo.segundo_apellido || '',
            id_premium: userInfo.id_premium || 1,
            premium_type: userInfo.id_premium === 2 ? 'Premium' : 'Free'
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
        showError('Error', 'Las contraseñas no coinciden');
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
      
      showSuccess('Éxito', 'Perfil actualizado correctamente', () => {
        setIsEditing(false);
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showError('Error', 'No se pudo actualizar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({...userData});
  };

  // Función para refrescar datos con pull-to-refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Invalidar caché antes de refrescar para obtener datos frescos del servidor
      await invalidateCache('users');
      
      // Refrescar usando el hook de caché
      await refreshProfile();
      
    } catch (error) {
      console.error('Error al refrescar datos:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      setIsLoading(true);
      
      // Limpiar todo el caché
      await invalidateCache('users');
      
      // Forzar recarga desde la API
      const freshUserData = await api.users.getProfile();
      
      if (freshUserData) {
        const processedData: UserData = {
          email: freshUserData.email || '',
          role: freshUserData.id_rol?.toString() || '',
          roleDisplay: freshUserData.id_rol === 1 ? 'Admin' : 
                     freshUserData.id_rol === 2 ? 'Trabajador' : 
                     freshUserData.id_rol === 3 ? 'Veterinario' : 'Usuario',
          primer_nombre: freshUserData.primer_nombre || '',
          segundo_nombre: freshUserData.segundo_nombre || '',
          primer_apellido: freshUserData.primer_apellido || '',
          segundo_apellido: freshUserData.segundo_apellido || '',
          id_premium: freshUserData.id_premium || 1,
          premium_type: freshUserData.premium_type || 'Free'
        };
        
        setUserData(processedData);
        setFormData(processedData);
        
        showSuccess('Éxito', 'Perfil actualizado con datos frescos del servidor');
      }
    } catch (error) {
      console.error('Error al refrescar perfil:', error);
      showError('Error', 'No se pudo refrescar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    showConfirm(
      'Cerrar sesión',
      '¿Está seguro que desea cerrar sesión?',
      () => {
        logout();
      },
      'Cerrar sesión',
      'Cancelar'
    );
  };

  const handleDeleteAccount = () => {
    showConfirm(
      'Eliminar cuenta',
      '⚠️ ADVERTENCIA: Esta acción eliminará permanentemente tu cuenta y todos tus datos.\n\n¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción NO se puede deshacer.',
      async () => {
        try {
          setIsLoading(true);
          await api.users.deleteAccount();
          
          showSuccess(
            'Cuenta eliminada',
            'Tu cuenta ha sido eliminada exitosamente. Serás redirigido al inicio de sesión.',
            () => {
              logout();
              router.push('/login');
            }
          );
        } catch (error: any) {
          console.error('Error al eliminar cuenta:', error);
          showError(
            'Error',
            error.message || 'No se pudo eliminar la cuenta. Inténtalo de nuevo.'
          );
        } finally {
          setIsLoading(false);
        }
      },
      'Eliminar cuenta',
      'Cancelar'
    );
  };

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
    setCongratulationsData(null);
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
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[tw.colors.primary]}
            tintColor={tw.colors.primary}
          />
        }
      >
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={createStyles('flex-row items-center justify-center gap-2')}>
              {userData.role === '1' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>ADMINISTRADOR</Text>
                </View>
              )}
              {userData.id_premium === 2 && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              )}
              {userData.role === '2' && (
                <View style={styles.workerBadge}>
                  <Text style={styles.workerText}>TRABAJADOR</Text>
                </View>
              )}
              {userData.role === '3' && (
                <View style={styles.veterinaryBadge}>
                  <Text style={styles.veterinaryText}>VETERINARIO</Text>
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
            {(userData.role === '2' || userData.role === '3') && (
              <Text style={styles.helperText}>
                Solo el administrador puede gestionar la suscripción Premium
              </Text>
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
                
                {/* Separador visual */}
                <View style={styles.separator} />
                
                {/* Botón de eliminar cuenta solo visible en modo edición */}
                <TouchableOpacity 
                  style={styles.deleteAccountButton} 
                  onPress={handleDeleteAccount}
                  disabled={isLoading}
                >
                  <View style={createStyles('flex-row items-center')}>
                    <Ionicons name="trash-outline" size={18} color="#fff" style={createStyles('mr-2')} />
                    <Text style={styles.buttonText}>Eliminar cuenta</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Text style={styles.buttonText}>Editar perfil</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.buttonText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <PremiumUpgradeModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="¡Actualiza tu cuenta a Premium!"
        subtitle="Desbloquea todas las funcionalidades de CowTracker"
      />
      
      {/* Modal de Felicitaciones */}
      <CongratulationsModal
        visible={showCongratulations}
        onClose={handleCloseCongratulations}
        paymentData={congratulationsData}
      />
      
      {/* Modal personalizado */}
      <ModalComponent />
    </View>
  );
} 