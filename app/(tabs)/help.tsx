import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import { Stack } from 'expo-router'; // Removido para usar el header del layout
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "¿Cómo registro un nuevo animal?",
    answer: "Para registrar un nuevo animal, ve a la sección 'Ganado' y presiona el botón '+'. Completa la información requerida como número de identificación, nombre, género y otros datos relevantes."
  },
  {
    id: 2,
    question: "¿Cómo puedo gestionar mis granjas?",
    answer: "En la sección 'Granjas' puedes crear, editar y eliminar granjas. También puedes asignar trabajadores y veterinarios a cada granja específica."
  },
  {
    id: 3,
    question: "¿Qué es la cuenta Premium?",
    answer: "La cuenta Premium te permite registrar ganado ilimitado, acceder a reportes avanzados, exportar datos y recibir soporte prioritario. La cuenta gratuita está limitada a 2 animales."
  },
  {
    id: 4,
    question: "¿Cómo genero reportes?",
    answer: "Ve a la sección 'Reportes' donde puedes generar diferentes tipos de informes sobre tu ganado, ventas, producción y salud animal."
  },
  {
    id: 5,
    question: "¿Cómo registro información veterinaria?",
    answer: "Selecciona un animal específico y ve a la sección de información veterinaria. Allí puedes registrar tratamientos, diagnósticos y notas médicas."
  },
  {
    id: 6,
    question: "¿Puedo exportar mis datos?",
    answer: "Sí, con una cuenta Premium puedes exportar tus datos en formato Excel o PDF desde la sección de reportes."
  },
  {
    id: 7,
    question: "¿Cómo contacto al soporte técnico?",
    answer: "Puedes contactarnos a través del email soporte@cowtracker.com o llamando al +57 300 123 4567. Los usuarios Premium tienen soporte prioritario."
  },
  {
    id: 8,
    question: "¿Los datos están seguros?",
    answer: "Sí, todos los datos están encriptados y almacenados de forma segura. Realizamos copias de seguridad regulares para proteger tu información."
  }
];

export default function Help() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const isExpanded = (id: number) => expandedItems.includes(id);

  return (
    <View style={{ flex: 1 }}>
      {/* <Stack.Screen options={{ headerTitle: 'Ayuda y Soporte' }} /> */}
      {/* Header manejado por el layout */}
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Centro de Ayuda</Text>
          <Text style={styles.subtitle}>Preguntas frecuentes y soporte</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.faqContainer}>
            <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
            
            {faqData.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.questionContainer}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Ionicons 
                    name={isExpanded(item.id) ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#27ae60" 
                  />
                </TouchableOpacity>
                
                {isExpanded(item.id) && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={24} color="#27ae60" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>soporte@cowtracker.com</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="call" size={24} color="#27ae60" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Teléfono</Text>
                <Text style={styles.contactValue}>+57 300 123 4567</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="time" size={24} color="#27ae60" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Horario de atención</Text>
                <Text style={styles.contactValue}>Lunes a Viernes: 8:00 AM - 6:00 PM</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  },
  faqContainer: {
    margin: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  answerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 10,
  },
  contactContainer: {
    margin: 20,
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactInfo: {
    marginLeft: 15,
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#666666',
  },
});

 