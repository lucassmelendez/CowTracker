import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { reportStyles } from '../styles/reportStyles';
import { colors } from '../styles/commonStyles';

const IssueReportScreen = () => {
  const [reportText, setReportText] = useState('');

  const handleSendReport = () => {
    if (reportText.trim() === '') {
      Alert.alert('Error', 'Por favor escribe tu reporte antes de enviarlo.');
      return;
    }
    
    // Aquí se podría implementar la lógica para enviar el reporte
    Alert.alert(
      'Reporte Enviado', 
      'Gracias por tu reporte. Nuestro equipo lo revisará pronto.',
      [{ text: 'OK', onPress: () => setReportText('') }]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Ayuda',
      'Si tienes problemas con la aplicación, por favor describe detalladamente el problema que estás experimentando y nuestro equipo de soporte te ayudará lo antes posible.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={reportStyles.container}
    >
      <ScrollView contentContainerStyle={reportStyles.scrollContainer}>
        <View style={reportStyles.headerContainer}>
          <Text style={reportStyles.title}>Sistema de Reportes</Text>
          <Text style={reportStyles.subtitle}>
            Informa cualquier problema o sugerencia que tengas con la aplicación
          </Text>
        </View>
        
        <TouchableOpacity 
          style={reportStyles.problemButton}
          onPress={handleHelpPress}
        >
          <Text style={reportStyles.problemButtonText}>¿Tienes problemas?</Text>
        </TouchableOpacity>
        
        <View style={reportStyles.inputContainer}>
          <Text style={reportStyles.inputLabel}>Escribe tu reporte</Text>
          <TextInput
            style={reportStyles.textInput}
            multiline
            numberOfLines={8}
            placeholder="Describe aquí tu problema o sugerencia..."
            placeholderTextColor="#888"
            value={reportText}
            onChangeText={setReportText}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity 
          style={reportStyles.sendButton}
          onPress={handleSendReport}
        >
          <Text style={reportStyles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default IssueReportScreen; 