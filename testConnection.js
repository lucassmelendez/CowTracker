/**
 * Script para probar la conexión con el backend
 * Uso: node testConnection.js [prod]
 * Si se pasa el argumento 'prod', usará la URL de producción
 */

const axios = require('axios');
const { PROD_API_URL } = require('./src/config/env.cjs');

// URL de desarrollo (local)
const DEV_API_URL = 'http://192.168.1.84:5000/api';

// Determinar qué URL usar
const useProd = process.argv.includes('prod');
const API_URL = useProd ? PROD_API_URL : DEV_API_URL;

console.log(`Probando conexión a: ${API_URL}`);

async function testConnection() {
  try {
    console.log(`Enviando petición a ${API_URL}/test...`);
    const response = await axios.get(`${API_URL}/test`);
    
    console.log('\n✅ Conexión exitosa al backend!');
    console.log('Respuesta del servidor:');
    console.log(response.data);
    
    return true;
  } catch (error) {
    console.error('\n❌ Error al conectar con el backend:');
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Datos:', error.response.data);
    } else if (error.request) {
      // La petición fue realizada pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor.');
      console.error('¿Está el servidor corriendo en la dirección correcta?');
      console.error(`URL probada: ${API_URL}`);
    } else {
      // Algo ocurrió al configurar la petición
      console.error('Error al configurar la petición:', error.message);
    }
    
    return false;
  }
}

testConnection()
  .then(success => {
    if (!success) {
      console.log('\nSugerencias si no puedes conectar:');
      console.log('1. Verifica que el servidor esté corriendo');
      console.log('2. Comprueba que la IP local sea correcta');
      console.log('3. Si usas "prod", verifica que la API esté desplegada en Vercel');
      console.log('4. Revisa que no haya problemas de CORS o firewall');
    }
  }); 