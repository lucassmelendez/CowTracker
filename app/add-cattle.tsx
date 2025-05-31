import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AuthProvider } from '../src/components/AuthContext';
import { FarmProvider } from '../src/components/FarmContext';
import AddCattleScreen from '../src/screens/AddCattleScreen';
import { useLocalSearchParams } from 'expo-router';

// Componente para manejar errores de forma segura
function ErrorFallback(props) {
  // Manejo ultra seguro del error
  let errorMessage = 'Ha ocurrido un error desconocido';
  const err = props?.error;
  if (err) {
    if (typeof err === 'string') {
      errorMessage = err;
    } else if (err.message) {
      errorMessage = err.message;
    } else if (typeof err.toString === 'function') {
      errorMessage = err.toString();
    }
  }
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f8f8'}}>
      <Text style={{fontSize: 18, fontWeight: 'bold', color: '#e74c3c', marginBottom: 10}}>
        Error en la aplicación
      </Text>
      <Text style={{textAlign: 'center', marginBottom: 20}}>
        {errorMessage}
      </Text>
      <Text style={{fontSize: 14, color: '#7f8c8d', textAlign: 'center'}}>
        Por favor, intenta de nuevo o contacta con soporte si el problema persiste.
      </Text>
    </View>
  );
}

// ErrorBoundary manual para máxima compatibilidad
function SafeAddCattlePage() {
  const params = useLocalSearchParams();
  const id = params?.id;
  const [error, setError] = React.useState(null);

  try {
    if (error) throw error;
    return (
      <AuthProvider>
        <FarmProvider>
          <AddCattleScreen route={{ params: { cattleId: id } }} />
        </FarmProvider>
      </AuthProvider>
    );
  } catch (err) {
    return <ErrorFallback error={err} />;
  }
}

export default SafeAddCattlePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});