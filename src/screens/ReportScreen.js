import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { reportStyles } from '../styles/reportStyles';

const reports = [
  { id: '1', name: 'Informe de Ganado' },
  { id: '2', name: 'Informe de Ventas' },
  { id: '3', name: 'Informe de Ganancias' },
];

const ReportScreen = () => {
  const renderFarm = ({ item }) => (
    <View style={reportStyles.farmItem}>
      <Text style={reportStyles.farmName}>{item.name}</Text>
    </View>
  );

  const downloadPDF = () => {
    if (Platform.OS === 'web') {
      const content = `
        <html>
          <head>
            <title>Informe de Granjas</title>
          </head>
          <body>
            <h1 style="text-align: center;">Lista de Granjas</h1>
            <ul>
              ${reports.map((farm) => `<li>${farm.name}</li>`).join('')}
            </ul>
          </body>
        </html>
      `;

      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'Informe_Granjas.pdf';
      link.click();

      URL.revokeObjectURL(url);
    } else {
      alert('La descarga de PDF solo está disponible en la web.');
    }
  };

  return (
    <View style={reportStyles.container}>
      <Text style={reportStyles.title}>Tipos de Informes</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderFarm}
      />
      <View style={reportStyles.buttonContainer}>
        <TouchableOpacity 
          style={reportStyles.downloadButton} 
          onPress={downloadPDF}
        >
          <Text style={reportStyles.buttonText}>Descargar Informe en PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReportScreen;