import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { productionStyles } from '../styles/productionStyles';

const ProductionScreen = () => {
  const router = useRouter();

  return (
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
  );
};

export default ProductionScreen;