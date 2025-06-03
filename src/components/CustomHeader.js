import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import FarmSelector from './FarmSelector';
import { useFarm } from './FarmContext';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';

function CustomHeader({ title }) {
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

  const handleNavigateToFarms = () => {
    setProfileMenuVisible(false);
    router.push('/farms');
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
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={20} color="#ffffff" />
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
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={18} color="#333" />
                <Text style={styles.menuItemText}>Mi Perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleNavigateToFarms}
                activeOpacity={0.7}
              >
                <Ionicons name="home-outline" size={18} color="#333" />
                <Text style={styles.menuItemText}>Mis Granjas</Text>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="exit-outline" size={18} color="#e74c3c" />
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 50,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
    flex: 1,
    marginRight: 10,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  farmSelectorWrapper: {
    marginRight: 8,
    maxWidth: 180,
    minWidth: 120,
  },
  profileButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  profileMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 260,
    marginTop: Platform.OS === 'android' ? 70 : 60,
    marginRight: 15,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
    }),
    overflow: 'hidden',
  },
  profileHeader: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 50,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  logoutText: {
    color: '#e74c3c',
  },
});

export default CustomHeader; 