// Simulador de conexión a MongoDB
const connectDB = async () => {
  try {
    console.log('Simulando conexión a MongoDB (modo de desarrollo sin DB)');
    // Simulamos una conexión exitosa
    global.mockDB = {
      users: [],
      cattle: []
    };
    return { connection: { host: 'mock-db-server' } };
  } catch (error) {
    console.error(`Error al conectar a la base de datos: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 