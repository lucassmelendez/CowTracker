import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PDFDownloadLink, Page, Text as PDFText, Document, StyleSheet as PDFStyles } from '@react-pdf/renderer';

// Estilos para el PDF
const pdfStyles = PDFStyles.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    marginBottom: 5,
  },
});

// Componente del documento PDF
const ReportDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <PDFText style={pdfStyles.title}>Informe de Ganado</PDFText>
      {data.map((item, index) => (
        <View key={index} style={pdfStyles.section}>
          <PDFText style={pdfStyles.text}>Identificador: {item.identifier}</PDFText>
          <PDFText style={pdfStyles.text}>Nombre: {item.name}</PDFText>
          <PDFText style={pdfStyles.text}>Tipo: {item.type}</PDFText>
          <PDFText style={pdfStyles.text}>Raza: {item.breed}</PDFText>
          <PDFText style={pdfStyles.text}>Peso: {item.weight} kg</PDFText>
          <PDFText style={pdfStyles.text}>Ubicación: {item.location}</PDFText>
        </View>
      ))}
    </Page>
  </Document>
);

// Pantalla del informe
const ReportScreen = () => {
  // Datos ficticios para el informe
  const cattleData = [
    {
      identifier: 'BOV-2023-001',
      name: 'Estrella',
      type: 'Vaca',
      breed: 'Holstein',
      weight: 450,
      location: 'Potrero Norte',
    },
    {
      identifier: 'BOV-2023-002',
      name: 'Luna',
      type: 'Vaca',
      breed: 'Jersey',
      weight: 400,
      location: 'Potrero Sur',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informe de Ganado</Text>
      <PDFDownloadLink
        document={<ReportDocument data={cattleData} />}
        fileName="informe_ganado.pdf"
        style={styles.downloadButton}
      >
        {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar Informe en PDF')}
      </PDFDownloadLink>
    </View>
  );
};

// Estilos para la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    textDecoration: 'none',
  },
});

export default ReportScreen;