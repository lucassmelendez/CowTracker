import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity, Modal, Platform, Animated } from 'react-native';
import FarmSelector from './FarmSelector';
import { useFarm } from './FarmContext';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';

function CustomHeader({ title }) {
  const { selectedFarm, selectFarm } = useFarm();
  const { userInfo, logout } = useAuth();
  const router = useRouter();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const handleProfilePress = () => {
    // Animación de escala al presionar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setProfileMenuVisible(true);
  };

  return (
    <View style={styles.headerContainer}>
      {/* Título con gradiente visual */}
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.titleUnderline} />
      </View>
      
      <View style={styles.headerRightContainer}>
        {/* Selector de granja mejorado */}
        <View style={styles.farmSelectorWrapper}>
          <FarmSelector 
            selectedFarm={selectedFarm} 
            onSelectFarm={selectFarm} 
          />
        </View>
        
        {/* Botón de perfil mejorado */}
        <Animated.View style={[styles.profileButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.profileButtonInner}>
              <Ionicons name="person" size={20} color="#ffffff" />
              <View style={styles.profileIndicator} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Modal mejorado */}
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
              {/* Header del perfil */}
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatarContainer}>
                  <View style={styles.profileAvatar}>
                    <Ionicons name="person" size={24} color="#2E8B57" />
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {userInfo?.name || userInfo?.displayName || 'Usuario'}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {userInfo?.email || ''}
                  </Text>
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>
                      {userInfo?.role || 'Usuario'}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Opciones del menú */}
              <View style={styles.menuContent}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleNavigateToProfile}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="person-outline" size={20} color="#4A90E2" />
                  </View>
                  <Text style={styles.menuItemText}>Mi Perfil</Text>
                  <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleNavigateToFarms}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="home-outline" size={20} color="#48BB78" />
                  </View>
                  <Text style={styles.menuItemText}>Mis Granjas</Text>
                  <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
                </TouchableOpacity>
                
                <View style={styles.menuDivider} />
                
                <TouchableOpacity 
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                    <Ionicons name="exit-outline" size={20} color="#F56565" />
                  </View>
                  <Text style={[styles.menuItemText, styles.logoutText]}>Cerrar sesión</Text>
                  <Ionicons name="chevron-forward" size={16} color="#F56565" />
                </TouchableOpacity>
              </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleUnderline: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 4,
    borderRadius: 1,
    width: '60%',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  farmSelectorWrapper: {
    marginRight: 12,
    maxWidth: 180,
    minWidth: 120,
  },
  profileButtonContainer: {
    position: 'relative',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  profileButtonInner: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#48BB78',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  profileMenuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: 280,
    marginTop: Platform.OS === 'android' ? 80 : 70,
    marginRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 12,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
    }),
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#F7FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileAvatarContainer: {
    marginRight: 16,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E8B57',
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
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  profileEmail: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutIconContainer: {
    backgroundColor: '#FED7D7',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutText: {
    color: '#F56565',
    fontWeight: '600',
  },
});

export default CustomHeader; 