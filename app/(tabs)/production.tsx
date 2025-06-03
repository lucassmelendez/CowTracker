import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { productionStyles } from '../../src/styles/productionStyles';

export default function ProductionTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={productionStyles.container}>
        <View style={productionStyles.header}>
          <Text style={productionStyles.headerText}>Producción</Text>
        </View>

        <View style={productionStyles.content}>
          <TouchableOpacity 
            style={productionStyles.button}
            onPress={() => router.push('/(tabs)/cattle-sale')}
          >
            <Text style={productionStyles.buttonIcon}>🐄</Text>
            <Text style={productionStyles.buttonText}>Registrar Venta de Ganado</Text>
            <Text style={productionStyles.buttonDescription}>Registra las ventas de ganado realizadas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={productionStyles.button}
            onPress={() => router.push('/(tabs)/milk-sale')}
          >
            <Text style={productionStyles.buttonIcon}>🥛</Text>
            <Text style={productionStyles.buttonText}>Registrar Venta de Leche</Text>
            <Text style={productionStyles.buttonDescription}>Registra las ventas de leche realizadas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});