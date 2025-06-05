import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import FarmSelector from './FarmSelector';
import { useFarm } from './FarmContext';
import { useRouter } from 'expo-router';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, showBackButton = true }) => {
  const { selectedFarm, selectFarm } = useFarm();
  const router = useRouter();

  const handleNavigateToProfile = (): void => {
    router.push('/(tabs)/profile');
  };

  const handleGoBack = (): void => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Si no puede ir atrás, navegar a la página principal
      router.replace('/(tabs)');
    }
  };

  const handleTitlePress = (): void => {
    router.replace('/(tabs)');
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
      <TouchableOpacity onPress={handleTitlePress} style={styles.titleContainer}>
        <Text style={[styles.headerTitle, !showBackButton && styles.headerTitleNoBack]}>{title}</Text>
      </TouchableOpacity>
      
      <View style={styles.headerRightContainer}>
        <View style={styles.farmSelectorWrapper}>
          <FarmSelector 
            selectedFarm={selectedFarm} 
            onSelectFarm={selectFarm} 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleNavigateToProfile}
        >
          <Ionicons name="person-circle" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 5,
    paddingVertical: 10,
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
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ffffff',
  },
  headerTitleNoBack: {
    marginLeft: 10,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  farmSelectorWrapper: {
    marginRight: 8,
    padding: 4,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  },
});

export default CustomHeader; 