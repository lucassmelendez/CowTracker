/**
 * Este archivo contiene datos de respaldo para usar cuando las llamadas a la API fallan
 * Ayuda a mantener la aplicación funcionando incluso cuando hay problemas en el backend
 */

// Datos de respaldo para ganado
const fallbackCattleData = [
  {
    id_ganado: 1001,
    _id: "fallback-1001",
    nombre: "Luna (Datos locales)",
    numero_identificacion: "FB-1001",
    tipo: "Vaca lechera",
    raza: "Holstein",
    genero: { descripcion: "Hembra" },
    estado_salud: { descripcion: "Saludable" },
    peso: 450,
    peso_kg: 450,
    precio_compra: 1200,
    nota: "Datos locales de respaldo generados cuando la API no está disponible"
  },
  {
    id_ganado: 1002,
    _id: "fallback-1002",
    nombre: "Tornado (Datos locales)",
    numero_identificacion: "FB-1002",
    tipo: "Toro",
    raza: "Angus",
    genero: { descripcion: "Macho" },
    estado_salud: { descripcion: "Saludable" },
    peso: 650,
    peso_kg: 650,
    precio_compra: 1500,
    nota: "Datos locales de respaldo generados cuando la API no está disponible"
  },
  {
    id_ganado: 1003,
    _id: "fallback-1003",
    nombre: "Estrella (Datos locales)",
    numero_identificacion: "FB-1003",
    tipo: "Vaca",
    raza: "Jersey",
    genero: { descripcion: "Hembra" },
    estado_salud: { descripcion: "En tratamiento" },
    peso: 380,
    peso_kg: 380,
    precio_compra: 950,
    nota: "Datos locales de respaldo generados cuando la API no está disponible"
  }
];

// Datos adicionales para más variedad
const razas = ["Holstein", "Jersey", "Angus", "Brahman", "Hereford", "Charolais", "Simmental"];
const tipos = ["Vaca lechera", "Toro", "Vaca", "Novillo", "Ternero", "Buey"];
const estados = ["Saludable", "En tratamiento", "Observación", "Recuperación", "Cuarentena"];
const nombres = ["Luna", "Estrella", "Tornado", "Rayo", "Manchas", "Bella", "Negro", "Canela", "Rocky", "Tormenta"];

// Función para generar un nombre único
const generarNombre = (index) => {
  const nombreBase = nombres[index % nombres.length];
  return `${nombreBase} (Local ${index})`;
};

// Función para generar datos de ganado para una granja específica
const generateFallbackCattleForFarm = (farmId, farmName, count = 5) => {
  const cattle = [];
  
  for (let i = 0; i < count; i++) {
    // Generar datos aleatorios para más variedad
    const genero = i % 2 === 0 ? "Hembra" : "Macho";
    const raza = razas[Math.floor(Math.random() * razas.length)];
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const peso = 300 + Math.floor(Math.random() * 400); // Entre 300 y 700kg
    const precio = 800 + Math.floor(Math.random() * 1200); // Entre 800 y 2000
    
    // Crear una nueva instancia para cada animal
    cattle.push({
      id_ganado: 2000 + i,
      _id: `fallback-${farmId}-${i}`,
      nombre: generarNombre(i),
      identificationNumber: `F${farmId}-${i+1000}`,
      numero_identificacion: `F${farmId}-${i+1000}`,
      tipo: tipo,
      type: tipo,
      raza: raza,
      breed: raza,
      genero: { descripcion: genero },
      gender: genero,
      estado_salud: { descripcion: estado },
      healthStatus: estado,
      peso: peso,
      peso_kg: peso,
      weight: peso,
      precio_compra: precio,
      purchasePrice: precio,
      farmId: farmId,
      id_finca: farmId,
      farmName: farmName,
      finca: {
        id_finca: farmId,
        nombre: farmName
      },
      // Agregar contexto de que estos son datos de respaldo
      nota: `Datos de respaldo generados automáticamente - Granja: ${farmName}`,
      notes: `Datos de respaldo generados automáticamente - Granja: ${farmName}`
    });
  }
  
  return cattle;
};

module.exports = {
  fallbackCattleData,
  generateFallbackCattleForFarm
};
