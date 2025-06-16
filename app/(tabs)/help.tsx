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
    answer: "Ve a la sección 'Explorar' y presiona el botón '+' para agregar ganado. Completa la información requerida: número de identificación, nombre, género (Macho/Hembra), estado de salud (Saludable/Enfermo/En tratamiento), tipo de producción (Leche/Carne), selecciona la granja y agrega notas si es necesario."
  },
  {
    id: 2,
    question: "¿Cómo edito la información de un animal?",
    answer: "Ve a los detalles del animal desde la lista de ganado, presiona el botón 'Editar' y modifica los campos necesarios. Los cambios se guardarán automáticamente y se reflejarán inmediatamente en la página de detalles."
  },
  {
    id: 3,
    question: "¿Cómo gestiono mis granjas?",
    answer: "En la sección 'Granjas' puedes crear nuevas granjas, editarlas y eliminarlas. También puedes asignar trabajadores y veterinarios a cada granja específica mediante códigos de vinculación."
  },
  {
    id: 4,
    question: "¿Cómo funciona el sistema de códigos QR?",
    answer: "Cada animal tiene un código QR único que puedes generar desde sus detalles. Este código permite identificar rápidamente al animal y acceder a su información mediante el escáner QR integrado en la aplicación."
  },
  {
    id: 5,
    question: "¿Cómo registro información veterinaria?",
    answer: "Desde los detalles de un animal, los veterinarios pueden agregar registros médicos incluyendo fecha de tratamiento, diagnóstico, medicamentos, dosis y notas. Esta información se vincula automáticamente al historial del animal."
  },
  {
    id: 6,
    question: "¿Cómo registro ventas de ganado y leche?",
    answer: "Ve a la sección correspondiente (Venta de Ganado o Venta de Leche), selecciona los animales, ingresa cantidad, precio y datos del comprador. Las ventas quedan registradas y puedes consultarlas en el historial."
  },
  {
    id: 7,
    question: "¿Qué tipos de reportes puedo generar?",
    answer: "En la sección 'Reportes' puedes generar estadísticas detalladas sobre tu ganado, incluyendo distribución por género, estado de salud, tipo de producción, registros veterinarios y análisis de ventas con gráficos interactivos."
  },
  {
    id: 8,
    question: "¿Qué es la cuenta Premium?",
    answer: "La cuenta Premium te permite registrar ganado ilimitado, acceder a todas las funcionalidades de la aplicación y recibir soporte prioritario. La cuenta gratuita está limitada a 2 animales."
  },
  {
    id: 9,
    question: "¿Cómo funcionan los roles de usuario?",
    answer: "Existen tres roles: Administrador (acceso completo), Trabajador (puede gestionar ganado y granjas) y Veterinario (especializado en registros médicos). Cada rol tiene permisos específicos según sus responsabilidades."
  },
  {
    id: 10,
    question: "¿Cómo vinculo usuarios a mis granjas?",
    answer: "Como administrador, ve a la sección 'Vinculación' para generar códigos únicos. Comparte estos códigos con trabajadores o veterinarios para que puedan unirse a tu granja con los permisos correspondientes."
  },
  {
    id: 11,
    question: "¿Cómo uso el escáner QR?",
    answer: "Ve a la sección 'Escáner QR' y enfoca la cámara hacia el código QR del animal. La aplicación automáticamente te llevará a los detalles del animal escaneado."
  },
  {
    id: 12,
    question: "¿Puedo exportar mis datos?",
    answer: "Sí, desde la sección de reportes puedes exportar los datos en diferentes formatos. Los usuarios Premium tienen acceso a opciones de exportación avanzadas."
  },
  {
    id: 13,
    question: "¿Cómo actualizo mi perfil?",
    answer: "Ve a la sección 'Perfil' donde puedes actualizar tu información personal, cambiar tipo de cuenta Premium, y gestionar la configuración de la aplicación."
  },
  {
    id: 14,
    question: "¿Qué hago si encuentro un problema?",
    answer: "Ve a la sección 'Reportar Problema' donde puedes enviar reportes detallados sobre errores o sugerencias. También puedes contactar directamente al soporte técnico."
  },
  {
    id: 15,
    question: "¿Los datos están seguros?",
    answer: "Sí, todos los datos están encriptados y almacenados de forma segura en Supabase. Realizamos copias de seguridad automáticas y utilizamos autenticación robusta para proteger tu información."
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
          <Text style={styles.subtitle}>Guía completa de CowTracker</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Sección de inicio rápido */}
          <View style={styles.quickStartContainer}>
            <Text style={styles.sectionTitle}>🚀 Inicio Rápido</Text>
            <View style={styles.quickStartCard}>
              <Text style={styles.quickStartTitle}>Primeros pasos con CowTracker:</Text>
              <Text style={styles.quickStartStep}>1. Crea tu primera granja en la sección 'Granjas'</Text>
              <Text style={styles.quickStartStep}>2. Registra tus primeros animales desde 'Ganado'</Text>
              <Text style={styles.quickStartStep}>3. Genera códigos QR para identificación rápida</Text>
              <Text style={styles.quickStartStep}>4. Invita a tu equipo usando códigos de vinculación</Text>
              <Text style={styles.quickStartStep}>5. Consulta reportes y estadísticas en tiempo real</Text>
            </View>
          </View>

          {/* Sección de funcionalidades principales */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>✨ Funcionalidades Principales</Text>
            
            <View style={styles.featureCard}>
              <Ionicons name="list" size={24} color="#27ae60" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Gestión de Ganado</Text>
                <Text style={styles.featureDescription}>Registro, edición y seguimiento completo de animales</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="business" size={24} color="#27ae60" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Administración de Granjas</Text>
                <Text style={styles.featureDescription}>Gestión de múltiples granjas y asignación de personal</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="medical" size={24} color="#27ae60" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Registros Veterinarios</Text>
                <Text style={styles.featureDescription}>Historial médico completo y seguimiento de tratamientos</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="analytics" size={24} color="#27ae60" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Reportes y Análisis</Text>
                <Text style={styles.featureDescription}>Estadísticas detalladas y gráficos interactivos</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="card" size={24} color="#27ae60" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Gestión de Ventas</Text>
                <Text style={styles.featureDescription}>Registro de ventas de ganado y productos lácteos</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="qr-code" size={24} color="#27ae60" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Códigos QR</Text>
                <Text style={styles.featureDescription}>Identificación rápida y acceso a información detallada</Text>
              </View>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.faqContainer}>
            <Text style={styles.sectionTitle}>❓ Preguntas Frecuentes</Text>
            
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

          {/* Información de contacto */}
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>📞 Contacto y Soporte</Text>
            
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={24} color="#27ae60" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email de Soporte</Text>
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
                <Text style={styles.contactLabel}>Horario de Atención</Text>
                <Text style={styles.contactValue}>Lunes a Viernes: 8:00 AM - 6:00 PM</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="location" size={24} color="#27ae60" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Ubicación</Text>
                <Text style={styles.contactValue}>Bogotá, Colombia</Text>
              </View>
            </View>
          </View>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>ℹ️ Información Adicional</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Versión de la Aplicación</Text>
              <Text style={styles.infoText}>CowTracker v1.0 - Sistema de Gestión Ganadera</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Desarrollo</Text>
              <Text style={styles.infoText}>Desarrollado con React Native y Supabase para garantizar la mejor experiencia y seguridad de datos.</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Actualizaciones</Text>
              <Text style={styles.infoText}>La aplicación se actualiza regularmente con nuevas funcionalidades y mejoras basadas en el feedback de los usuarios.</Text>
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
  
  // Estilos para Inicio Rápido
  quickStartContainer: {
    margin: 20,
    marginBottom: 10,
  },
  quickStartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  quickStartStep: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    paddingLeft: 10,
  },

  // Estilos para Funcionalidades
  featuresContainer: {
    margin: 20,
    marginBottom: 10,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureInfo: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
  },

  // Estilos existentes para FAQ
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

  // Estilos para Contacto
  contactContainer: {
    margin: 20,
    marginBottom: 10,
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

  // Estilos para Información Adicional
  infoContainer: {
    margin: 20,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

 