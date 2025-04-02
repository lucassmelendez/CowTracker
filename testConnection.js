const axios = require('axios');

// La URL del API que estamos usando en el frontend
const API_URL = 'http://192.168.1.84:5000/api';

async function testConnection() {
  try {
    console.log(`Probando conexión a ${API_URL}/test...`);
    
    const response = await axios.get(`${API_URL}/test`);
    
    console.log('Conexión exitosa!');
    console.log('Respuesta:', response.data);
    
    return true;
  } catch (error) {
    console.error('Error de conexión:');
    
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Código de estado:', error.response.status);
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
      console.error('Detalles:', error.request);
    } else {
      // Algo sucedió al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    return false;
  }
}

// Ejecutar la prueba
testConnection()
  .then(success => {
    if (success) {
      console.log('\n¡La conexión funciona correctamente!');
      console.log('Deberías poder iniciar sesión en la aplicación ahora.');
    } else {
      console.log('\nLa conexión no funciona.');
      console.log('Verifica:');
      console.log('1. Que el servidor esté en ejecución en el puerto 5000');
      console.log('2. Que la dirección IP (192.168.1.84) sea correcta');
      console.log('3. Que no haya firewall bloqueando la conexión');
    }
  })
  .catch(err => console.error('Error inesperado:', err)); 