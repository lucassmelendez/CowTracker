import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { reportStyles } from '../styles/reportStyles';
import { colors } from '../styles/commonStyles';

const reports = [
  { id: '1', name: 'Informe de Ganado' },
  { id: '2', name: 'Informe de Ventas' },
  { id: '3', name: 'Informe de Ganancias' },
  { id: '4', name: 'Informe de Salud Animal' },
  { id: '5', name: 'Informe de Producción Lechera' },
];

const ReportScreen = () => {
  const renderReportItem = ({ item }) => (
    <View style={reportStyles.reportItem}>
      <Text style={reportStyles.reportName}>{item.name}</Text>
    </View>
  );

  const downloadPDF = () => {
    if (Platform.OS === 'web') {
      const content = `
        <html>
          <head>
            <title>Informe de Ganado</title>
          </head>
          <body>
            <h1 style="text-align: center;">Listado de Informes</h1>
            <ul>
              ${reports.map((report) => `<li>${report.name}</li>`).join('')}
            </ul>
          </body>
        </html>
      `;

      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'Informe_Ganado.pdf';
      link.click();

      URL.revokeObjectURL(url);
    } else {
      alert('La descarga de PDF solo está disponible en la web.');
    }
  };

  return (
    <View style={reportStyles.container}>
      <Text style={reportStyles.title}>Informes Disponibles</Text>
      <Text style={reportStyles.subtitle}>Selecciona el tipo de informe que deseas generar</Text>
      
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportItem}
        style={reportStyles.reportList}
      />
      
      <View style={reportStyles.buttonContainer}>
        <TouchableOpacity 
          style={reportStyles.downloadButton} 
          onPress={downloadPDF}
        >
          <Text style={reportStyles.buttonText}>Generar Informe en PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReportScreen;