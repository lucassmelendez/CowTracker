import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import FarmSelector from '../../components/FarmSelector';
import { useFarm } from '../../components/FarmContext';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'expo-router';

function CustomHeader({ title, showBackButton = false }: { title: string; showBackButton?: boolean }) {
  const { selectedFarm, selectFarm } = useFarm();
  const { userInfo, logout } = useAuth();
  const router = useRouter();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setProfileMenuVisible(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigateToProfile = () => {
    setProfileMenuVisible(false);
    router.push('/profile');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Si no puede ir atrás, navegar a la página principal
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.headerContainer}>
      {showBackButton && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
      <Text style={[styles.headerTitle, !showBackButton && styles.headerTitleNoBack]}>{title}</Text>
      
      <View style={styles.headerRightContainer}>
        <FarmSelector 
          selectedFarm={selectedFarm} 
          onSelectFarm={selectFarm} 
        />
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setProfileMenuVisible(true)}
        >
          <Ionicons name="person-circle" size={24} color="#ffffff" />
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={profileMenuVisible}
          onRequestClose={() => setProfileMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setProfileMenuVisible(false)}
          >
            <View style={styles.profileMenuContainer}>
              <View style={styles.profileHeader}>
                <Text style={styles.profileName}>
                  {userInfo?.name || userInfo?.displayName || 'Usuario'}
                </Text>
                <Text style={styles.profileEmail}>
                  {userInfo?.email || ''}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleNavigateToProfile}
              >
                <Ionicons name="person" size={18} color="#333" />
                <Text style={styles.menuItemText}>Mi Perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  router.push('/farms');
                  setProfileMenuVisible(false);
                }}
              >
                <Ionicons name="business" size={18} color="#333" />
                <Text style={styles.menuItemText}>Granjas</Text>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={18} color="#e74c3c" />
                <Text style={[styles.menuItemText, styles.logoutText]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#ffffff'
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <CustomHeader title="AgroControl" />,
        }}
      />
      <Stack.Screen
        name="explore"
        options={{
          headerTitle: () => <CustomHeader title="Ganado" showBackButton={true} />,
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          headerTitle: () => <CustomHeader title="Administración" showBackButton={true} />,
        }}
      />
      <Stack.Screen
        name="production"
        options={{
          headerTitle: () => <CustomHeader title="Producción" showBackButton={true} />,
        }}
      />
      <Stack.Screen
        name="veterinary-data"
        options={{
          headerTitle: () => <CustomHeader title="Datos Veterinarios" showBackButton={true} />,
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          headerTitle: () => <CustomHeader title="Informes" showBackButton={true} />,
        }}
      />
      <Stack.Screen
        name="sales"
        options={{
          headerTitle: () => <CustomHeader title="Ventas" showBackButton={true} />,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 5,
  },
  backButton: {
    padding: 8,
    marginLeft: 5,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
    flex: 1,
  },
  headerTitleNoBack: {
    marginLeft: 5,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  profileButton: {
    marginLeft: 10,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  profileMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 250,
    marginTop: 60,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  profileHeader: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutText: {
    color: '#e74c3c',
  },
});
