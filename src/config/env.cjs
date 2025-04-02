/**
 * Configuración de entornos para la aplicación (versión CommonJS)
 */

// URL del backend en producción (Vercel)
const PROD_API_URL = 'https://cow-tracker-one.vercel.app/api';

// Determina si estamos en modo producción o desarrollo
const isProd = false; // Cambia a true para usar la API de producción

// Para tests locales con IP específica
const LOCAL_IP = '192.168.1.84';

module.exports = {
  PROD_API_URL,
  isProd,
  LOCAL_IP
}; 