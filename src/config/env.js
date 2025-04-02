/**
 * Configuración de entornos para la aplicación
 */

// URL del backend en producción (Vercel)
export const PROD_API_URL = 'https://cow-tracker-one.vercel.app/api';

// Determina si estamos en modo producción o desarrollo
export const isProd = true; // Cambia a false para usar la API local

// Para tests locales con IP específica
export const LOCAL_IP = '192.168.1.84'; 