import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, StyleSheet } from 'react-native';

const reports = [
  { id: '1', name: 'Informe de Ganado' },
  { id: '2', name: 'Informe de Ventas' },
  { id: '3', name: 'Informe de Ganancias' },
  { id: '4', name: 'Informe de Salud Animal' },
  { id: '5', name: 'Informe de Producción Lechera' },
];

const Report = () => {
  const renderReportItem = ({ item }: { item: any }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportName}>{item.name}</Text>
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
    <View style={styles.container}>
      <Text style={styles.title}>Informes Disponibles</Text>
      <Text style={styles.subtitle}>Selecciona el tipo de informe que deseas generar</Text>
      
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportItem}
        style={styles.reportList}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.downloadButton} 
          onPress={downloadPDF}
        >
          <Text style={styles.buttonText}>Generar Informe en PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333333'
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
  },
  reportList: {
    flex: 1,
    marginBottom: 20,
  },
  reportItem: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
  },
  reportName: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  problemButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  problemButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    minHeight: 150,
  },
  sendButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportTypeContainer: {
    marginBottom: 20,
  },
  reportTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  reportTypeButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: '40%',
    alignItems: 'center',
  },
  reportTypeButtonSelected: {
    backgroundColor: '#27ae60',
  },
  reportTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  reportTypeTextSelected: {
    color: '#ffffff',
  },
  infoText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default Report;