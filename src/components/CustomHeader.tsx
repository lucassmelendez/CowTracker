import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import FarmSelector from './FarmSelector';
import { useFarm } from './FarmContext';
import { useAuth } from './AuthContext';
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
    console.log('Navegando a perfil');
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.headerRightContainer}>
        <View style={styles.farmSelectorWrapper}>
          <FarmSelector 
            selectedFarm={selectedFarm} 
            onSelectFarm={selectFarm} 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setProfileMenuVisible(true)}
        >
          <Ionicons name="person-circle" size={28} color="#ffffff" />
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
                  console.log('Navegando a granjas');
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

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 5,
    paddingVertical: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ffffff',
    marginLeft: 10,
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  farmSelectorWrapper: {
    marginRight: 8,
    padding: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 3,
  },
  profileButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
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

export default CustomHeader; 