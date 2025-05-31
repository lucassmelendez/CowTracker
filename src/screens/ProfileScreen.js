import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { getShadowStyle } from '../utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from '../styles/profileStyles';
import api from '../services/api';

const ProfileScreen = () => {
  const { currentUser, userInfo, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    email: '',
    role: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: ''
  });
  const [formData, setFormData] = useState({...userData});

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        // Intentar obtener el perfil actualizado del servidor
        const profileData = await api.users.getProfile();
        
        const formattedData = {
          email: profileData.email || '',
          role: profileData.role === 'admin' ? 'Administrador' : 
                profileData.role === 'veterinario' ? 'Veterinario' :
                profileData.role === 'trabajador' ? 'Trabajador' : 'Usuario',
          primer_nombre: profileData.primer_nombre || '',
          segundo_nombre: profileData.segundo_nombre || '',
          primer_apellido: profileData.primer_apellido || '',
          segundo_apellido: profileData.segundo_apellido || ''
        };
        
        setUserData(formattedData);
        setFormData(formattedData);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        // Si falla, usar datos del contexto
        if (userInfo) {
          const fallbackData = {
            email: userInfo.email || currentUser?.email || '',
            role: userInfo.role === 'admin' ? 'Administrador' : 
                  userInfo.role === 'veterinario' ? 'Veterinario' :
                  userInfo.role === 'trabajador' ? 'Trabajador' : 'Usuario',
            primer_nombre: userInfo.primer_nombre || '',
            segundo_nombre: userInfo.segundo_nombre || '',
            primer_apellido: userInfo.primer_apellido || '',
            segundo_apellido: userInfo.segundo_apellido || ''
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

      // Ya no construimos el nombre completo
      // Enviar los campos separados directamente
      const updateData = {
        email: formData.email,
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
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
        segundo_apellido: formData.segundo_apellido
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
      <View style={[profileStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={{ marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={profileStyles.container}>
      <View style={profileStyles.header}>
        <Text style={profileStyles.title}>Mi Perfil</Text>
        <Text style={profileStyles.subtitle}>Gestiona tu información personal</Text>
      </View>
      
      <ScrollView>
        <View style={profileStyles.card}>
          <View style={profileStyles.avatarContainer}>
            <View style={profileStyles.avatar}>
              <Text style={profileStyles.avatarText}>{getInitials()}</Text>
            </View>
            <Text style={profileStyles.role}>{userData.role}</Text>
          </View>
          
          <View style={profileStyles.infoContainer}>
            {isEditing ? (
              <>
                <Text style={profileStyles.label}>Primer nombre</Text>
                <TextInput
                  style={profileStyles.input}
                  value={formData.primer_nombre}
                  onChangeText={(text) => setFormData({...formData, primer_nombre: text})}
                  placeholder="Primer nombre"
                />
                
                <Text style={profileStyles.label}>Segundo nombre</Text>
                <TextInput
                  style={profileStyles.input}
                  value={formData.segundo_nombre}
                  onChangeText={(text) => setFormData({...formData, segundo_nombre: text})}
                  placeholder="Segundo nombre (opcional)"
                />
                
                <Text style={profileStyles.label}>Primer apellido</Text>
                <TextInput
                  style={profileStyles.input}
                  value={formData.primer_apellido}
                  onChangeText={(text) => setFormData({...formData, primer_apellido: text})}
                  placeholder="Primer apellido"
                />
                
                <Text style={profileStyles.label}>Segundo apellido</Text>
                <TextInput
                  style={profileStyles.input}
                  value={formData.segundo_apellido}
                  onChangeText={(text) => setFormData({...formData, segundo_apellido: text})}
                  placeholder="Segundo apellido (opcional)"
                />
              </>
            ) : (
              <>
                <Text style={profileStyles.label}>Primer nombre</Text>
                <Text style={profileStyles.infoText}>{userData.primer_nombre || 'No especificado'}</Text>
                
                <Text style={profileStyles.label}>Segundo nombre</Text>
                <Text style={profileStyles.infoText}>{userData.segundo_nombre || 'No especificado'}</Text>
                
                <Text style={profileStyles.label}>Primer apellido</Text>
                <Text style={profileStyles.infoText}>{userData.primer_apellido || 'No especificado'}</Text>
                
                <Text style={profileStyles.label}>Segundo apellido</Text>
                <Text style={profileStyles.infoText}>{userData.segundo_apellido || 'No especificado'}</Text>
              </>
            )}
            
            <Text style={profileStyles.label}>Correo electrónico</Text>
            {isEditing ? (
              <TextInput
                style={profileStyles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Correo electrónico"
                keyboardType="email-address"
              />
            ) : (
              <Text style={profileStyles.infoText}>{userData.email}</Text>
            )}
            
            {isEditing && (
              <>
                <Text style={profileStyles.label}>Nueva contraseña (opcional)</Text>
                <TextInput
                  style={profileStyles.input}
                  value={formData.password || ''}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  placeholder="Nueva contraseña"
                  secureTextEntry
                />
                
                <Text style={profileStyles.label}>Confirmar contraseña</Text>
                <TextInput
                  style={profileStyles.input}
                  value={formData.confirmPassword || ''}
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                  placeholder="Confirmar contraseña"
                  secureTextEntry
                />
              </>
            )}
          </View>
          
          <View style={profileStyles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity style={profileStyles.saveButton} onPress={handleSave}>
                  <Text style={profileStyles.buttonText}>Guardar cambios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={profileStyles.cancelButton} onPress={handleCancel}>
                  <Text style={profileStyles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={profileStyles.editButton} onPress={handleEdit}>
                <Text style={profileStyles.buttonText}>Editar perfil</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={profileStyles.logoutButton} onPress={handleLogout}>
              <Text style={profileStyles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;