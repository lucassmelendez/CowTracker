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
    name: '',
    email: '',
    phone: '',
    role: ''
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
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          role: profileData.role === 'admin' ? 'Administrador' : 'Usuario'
        };
        
        setUserData(formattedData);
        setFormData(formattedData);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        // Si falla, usar datos del contexto
        if (userInfo) {
          const fallbackData = {
            name: userInfo.name || currentUser?.displayName || '',
            email: userInfo.email || currentUser?.email || '',
            phone: userInfo.phone || '',
            role: userInfo.role === 'admin' ? 'Administrador' : 'Usuario'
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

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(formData.password ? { password: formData.password } : {})
      };

      setIsLoading(true);
      // Usar la función correcta del contexto de autenticación
      await updateProfile(updateData);
      
      // Actualizar los datos locales
      setUserData({
        ...userData,
        name: formData.name,
        email: formData.email,
        phone: formData.phone
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
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
              <Text style={profileStyles.avatarText}>{getInitials(userData.name)}</Text>
            </View>
            <Text style={profileStyles.role}>{userData.role}</Text>
          </View>
          
          <View style={profileStyles.infoContainer}>
            <Text style={profileStyles.label}>Nombre completo</Text>
            {isEditing ? (
              <TextInput
                style={profileStyles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Nombre completo"
              />
            ) : (
              <Text style={profileStyles.infoText}>{userData.name}</Text>
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
            
            <Text style={profileStyles.label}>Teléfono</Text>
            {isEditing ? (
              <TextInput
                style={profileStyles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={profileStyles.infoText}>{userData.phone || 'No especificado'}</Text>
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