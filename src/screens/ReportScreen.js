import React from 'react';
import { View, Text, FlatList, StyleSheet, Button, Platform } from 'react-native';

const farms = [
  { id: '1', name: 'Granja El Sol' },
  { id: '2', name: 'Granja La Luna' },
  { id: '3', name: 'Granja Los Pinos' },
];

const ReportScreen = () => {
  const renderFarm = ({ item }) => (
    <View style={styles.farmItem}>
      <Text style={styles.farmName}>{item.name}</Text>
    </View>
  );

  const downloadPDF = () => {
    if (Platform.OS === 'web') {
      // Crear contenido HTML para el PDF
      const content = `
        <html>
          <head>
            <title>Informe de Granjas</title>
          </head>
          <body>
            <h1 style="text-align: center;">Lista de Granjas</h1>
            <ul>
              ${farms.map((farm) => `<li>${farm.name}</li>`).join('')}
            </ul>
          </body>
        </html>
      `;

      // Crear un blob con el contenido HTML
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Crear un enlace para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Informe_Granjas.pdf';
      link.click();

      // Liberar el objeto URL
      URL.revokeObjectURL(url);
    } else {
      alert('La descarga de PDF solo está disponible en la web.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Granjas</Text>
      <FlatList
        data={farms}
        keyExtractor={(item) => item.id}
        renderItem={renderFarm}
      />
      <Button title="Descargar Informe en PDF" onPress={downloadPDF} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  farmItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  farmName: {
    fontSize: 18,
  },
});

export default ReportScreen;