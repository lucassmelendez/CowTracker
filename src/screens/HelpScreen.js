import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FAQ_DATA = [
  {
    id: '1',
    question: '¿Cómo puedo agregar una nueva vaca a mi ganado?',
    answer: 'Para agregar una nueva vaca, dirígete a la sección "Mi Ganado" en el menú principal, luego presiona el botón "+" o "Agregar" y completa el formulario con la información requerida del animal.'
  },
  {
    id: '2',
    question: '¿Cómo escaneo el código QR de un animal?',
    answer: 'Ve a la sección "Escanear QR" en el menú principal. Apunta la cámara de tu dispositivo hacia el código QR del animal y espera a que se escanee automáticamente para ver sus detalles.'
  },
  {
    id: '3',
    question: '¿Cómo genero un informe de mi ganado?',
    answer: 'Dirígete a la sección "Informe" en el menú principal, selecciona el tipo de informe que deseas generar, establece los filtros necesarios y presiona "Generar Informe".'
  },
  {
    id: '4',
    question: '¿Cómo registro la producción de leche?',
    answer: 'Ve a la sección "Producción" en el menú principal, selecciona "Registro de Leche", completa los campos con la cantidad producida, fecha y otros detalles, y guarda el registro.'
  },
  {
    id: '5',
    question: '¿Cómo administro los datos veterinarios?',
    answer: 'Accede a la sección "Datos veterinarios" en el menú principal. Allí puedes registrar visitas veterinarias, tratamientos, vacunas y otros datos importantes para la salud de tu ganado.'
  },
  {
    id: '6',
    question: '¿Puedo cambiar entre diferentes granjas?',
    answer: 'Sí, puedes cambiar entre granjas utilizando el selector de granjas ubicado en la parte superior de la aplicación. Toca el nombre de la granja actual para ver y seleccionar otras granjas disponibles.'
  },
  {
    id: '7',
    question: '¿Cómo actualizo la información de un animal?',
    answer: 'Ve a la sección "Mi Ganado", busca y selecciona el animal que deseas modificar. En la pantalla de detalles, presiona el botón "Editar" y actualiza la información necesaria.'
  },
  {
    id: '8',
    question: '¿Cómo registro una venta de ganado?',
    answer: 'Dirígete a la sección "Producción", selecciona "Venta de Ganado", completa el formulario con los detalles de la venta como precio, fecha y comprador, y guarda la transacción.'
  },
];

const HelpScreen = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preguntas Frecuentes</Text>
      <Text style={styles.subheader}>Encuentra respuestas a las preguntas más comunes sobre CowTracker</Text>
      
      <ScrollView style={styles.faqContainer}>
        {FAQ_DATA.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity 
              style={styles.questionContainer} 
              onPress={() => toggleExpand(item.id)}
            >
              <Text style={styles.questionText}>{item.question}</Text>
              <Ionicons 
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#666"
              />
            </TouchableOpacity>
            
            {expandedId === item.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.contactContainer}>
        <Text style={styles.contactHeader}>¿Necesitas más ayuda?</Text>
        <Text style={styles.contactText}>
          Si no encuentras la respuesta que buscas, contáctanos en soporte@cowtracker.com
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  faqContainer: {
    flex: 1,
  },
  faqItem: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  answerText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  contactContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e9f7fe',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  contactHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
});

export default HelpScreen; 