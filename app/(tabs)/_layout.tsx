import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import FarmSelector from '../../src/components/FarmSelector';
import { useFarm } from '../../src/components/FarmContext';
import { useAuth } from '../../src/components/AuthContext';
import { useRouter } from 'expo-router';

function CustomHeader({ title }: { title: string }) {
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

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      
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
                <Text style={styles.menuItemText}>Mis Granjas</Text>
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
          elevation: 1,
          shadowOpacity: 0,
          borderBottomWidth: 0,
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
          headerTitle: () => <CustomHeader title="Mi Ganado" />,
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          headerTitle: () => <CustomHeader title="Administración" />,
        }}
      />
      <Stack.Screen
        name="production"
        options={{
          headerTitle: () => <CustomHeader title="Producción" />,
        }}
      />
      <Stack.Screen
        name="veterinary-data"
        options={{
          headerTitle: () => <CustomHeader title="Datos Veterinarios" />,
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          headerTitle: () => <CustomHeader title="Informes" />,
        }}
      />
      <Stack.Screen
        name="sales"
        options={{
          headerTitle: () => <CustomHeader title="Ventas" />,
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
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
    marginLeft: 5,
    flex: 1,
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
