import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function ProductionScreen() {
  const router = useRouter();

  const navigateToMilkSale = () => {
    router.push('/(tabs)/milk-sale');
  };

  const navigateToCattleSale = () => {
    router.push('/(tabs)/cattle-sale');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Producción</Text>
        <Text style={styles.subtitle}>Gestiona las ventas y producción</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.optionCard} onPress={navigateToMilkSale}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🥛</Text>
          </View>
          <Text style={styles.optionTitle}>Venta de Leche</Text>
          <Text style={styles.optionDescription}>
            Registra y gestiona las ventas de leche de tu ganado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} onPress={navigateToCattleSale}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🐄</Text>
          </View>
          <Text style={styles.optionTitle}>Venta de Ganado</Text>
          <Text style={styles.optionDescription}>
            Registra y gestiona las ventas de ganado
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 15,
  },
  icon: {
    fontSize: 50,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
  },
});