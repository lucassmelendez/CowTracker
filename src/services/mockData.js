// Datos simulados para desarrollo cuando el servidor no está disponible
export const mockCattle = [
  {
    _id: '1',
    identificationNumber: 'BOV-001',
    type: 'Bovino',
    breed: 'Holstein',
    gender: 'Hembra',
    dateOfBirth: '2020-05-15',
    weight: 450,
    healthStatus: 'saludable',
    purchaseDate: '2021-01-10',
    purchasePrice: 800000,
    status: 'activo',
    location: {
      farm: {
        name: 'Granja El Encanto'
      }
    },
    notes: 'Animal en excelente condición'
  },
  {
    _id: '2',
    identificationNumber: 'BOV-002',
    type: 'Bovino',
    breed: 'Angus',
    gender: 'Macho',
    dateOfBirth: '2019-11-20',
    weight: 520,
    healthStatus: 'en tratamiento',
    purchaseDate: '2020-06-15',
    purchasePrice: 950000,
    status: 'activo',
    location: {
      farm: {
        name: 'Granja El Encanto'
      }
    },
    notes: 'Recibiendo tratamiento preventivo'
  },
  {
    _id: '3',
    identificationNumber: 'BOV-003',
    type: 'Bovino',
    breed: 'Jersey',
    gender: 'Hembra',
    dateOfBirth: '2021-02-08',
    weight: 380,
    healthStatus: 'saludable',
    purchaseDate: '2021-08-20',
    purchasePrice: 750000,
    status: 'activo',
    location: {
      farm: {
        name: 'Granja La Esperanza'
      }
    },
    notes: 'Buena productora de leche'
  }
];

export const mockFarms = [
  {
    _id: '1',
    name: 'Granja El Encanto',
    location: 'San Carlos, Antioquia',
    size: '120 hectáreas',
    cattleCount: 85
  },
  {
    _id: '2',
    name: 'Granja La Esperanza',
    location: 'Rionegro, Antioquia',
    size: '75 hectáreas',
    cattleCount: 42
  },
  {
    _id: '3',
    name: 'Granja Los Alpes',
    location: 'La Ceja, Antioquia',
    size: '95 hectáreas',
    cattleCount: 68
  }
]; 