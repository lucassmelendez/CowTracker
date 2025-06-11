# 🐄 CowTracker - Sistema de Gestión de Ganado

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0-black.svg)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-orange.svg)](https://supabase.com/)
[![Webpay Plus](https://img.shields.io/badge/Webpay%20Plus-Payments-red.svg)](https://www.transbank.cl/)

## 📋 Descripción

CowTracker es una aplicación móvil y web completa para la gestión integral de ganado bovino. Permite a ganaderos y veterinarios llevar un control detallado de su ganado, granjas, registros veterinarios y realizar pagos seguros para funcionalidades premium.

### ✨ Características Principales

- 🐮 **Gestión de Ganado**: Registro completo de animales con información detallada
- 🏡 **Administración de Granjas**: Control de múltiples ubicaciones
- 🏥 **Registros Veterinarios**: Historial médico y tratamientos
- 💳 **Pagos Webpay Plus**: Integración con sistema de pagos chileno
- 💎 **Sistema Premium**: Funcionalidades avanzadas con suscripción
- 💱 **Conversión de Moneda**: Precios en CLP y USD automáticamente
- 📊 **Reportes y Estadísticas**: Análisis detallado del ganado
- 🔐 **Autenticación Segura**: Sistema de usuarios con roles

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Servicios     │
│   React Native  │◄──►│   Express.js    │◄──►│   Supabase      │
│   Expo Router   │    │   Node.js       │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│   FastAPI       │◄─────────────┘
                        │   Webpay Plus   │
                        │   Banco Central │
                        └─────────────────┘
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Expo CLI
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/lucassmelendez/CowTracker.git
cd CowTracker
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# APIs
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_FASTAPI_URL=https://ct-fastapi.vercel.app
```

### 4. Iniciar el Proyecto

```bash
npx expo start
```

### 5. Abrir en Navegador

Una vez iniciado, presiona `w` en la consola para abrir en el navegador web.

## 🌐 Servicios y APIs

### Backend Express.js
- **URL Local**: `http://localhost:5000`
- **Funciones**: Autenticación, CRUD de datos, gestión de usuarios

### FastAPI (Webpay + Conversión)
- **URL Producción**: `https://ct-fastapi.vercel.app`
- **Funciones**: Pagos Webpay Plus, conversión de moneda

### Base de Datos Supabase
- **Tipo**: PostgreSQL
- **Funciones**: Almacenamiento de datos, autenticación, tiempo real

## 💳 Sistema de Pagos

### Webpay Plus Integration

El sistema integra Webpay Plus de Transbank para procesar pagos seguros:

```javascript
// Ejemplo de uso
const paymentData = {
  amount: 10000, // $10.000 CLP
  buy_order: 'premium_upgrade_123',
  session_id: 'session_456',
  return_url: 'http://localhost:8081/premium/activate'
};
```

### Conversión de Moneda

Integración con Banco Central de Chile para conversión automática:

```javascript
// Endpoint de conversión
GET /currency/convert?amount=10000&from_currency=CLP&to_currency=USD

// Respuesta
{
  "formatted": {
    "combined": "$10,000/11USD"
  }
}
```

## 📱 Funcionalidades por Versión

### 🆓 Versión Gratuita
- ✅ Registro hasta 2 cabezas de ganado
- ✅ 1 granja
- ✅ Registros básicos
- ✅ Autenticación

### 💎 Versión Premium ($10.000 CLP)
- ✅ Ganado ilimitado
- ✅ Granjas ilimitadas
- ✅ Reportes avanzados
- ✅ Exportación Excel/PDF
- ✅ Soporte prioritario
- ✅ Sincronización en la nube

## 🗄️ Estructura de Base de Datos

### Tablas Principales

```sql
-- Usuarios
usuario (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, id_rol, id_autentificar, id_premium)

-- Ganado
ganado (id_ganado, nombre, numero_identificacion, nota, id_finca, id_estado_salud, id_genero, id_informacion_veterinaria, id_produccion)

-- Granjas
finca (id_finca, nombre, tamano)

-- Información Veterinaria
informacion_veterinaria (id_informacion_veterinaria, fecha_tratamiento, diagnostico, tratamiento, nota)

-- Premium
premium (id_premium, descripcion) -- 1=Free, 2=Premium
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia Expo
npx expo start --web   # Solo web
npx expo start --ios   # Solo iOS
npx expo start --android # Solo Android

# Construcción
npx expo build:web     # Build para web
npx expo build:ios     # Build para iOS
npx expo build:android # Build para Android

# Utilidades
npm run lint           # Linter
npm run test           # Tests
```

## 🌍 Despliegue

### Frontend (Expo)
- **Desarrollo**: `npx expo start`
- **Producción**: Expo Application Services (EAS)

### Backend Express
- **Desarrollo**: `npm run dev`
- **Producción**: Railway, Heroku, o VPS

### FastAPI
- **Producción**: Vercel (actual)
- **URL**: `https://ct-fastapi.vercel.app`

## 🔐 Autenticación y Seguridad

- **Sistema**: Supabase Auth
- **Métodos**: Email/Password
- **Roles**: Admin, Veterinario, Trabajador, Usuario
- **JWT**: Tokens seguros para API calls

## 📊 Monitoreo y Logs

- **FastAPI**: Logs automáticos en Vercel
- **Express**: Winston logger
- **Frontend**: Expo logs y crash reporting

## 🤝 Contribución

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crear branch** de feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** cambios: `git commit -m 'Add nueva funcionalidad'`
4. **Push** al branch: `git push origin feature/nueva-funcionalidad`
5. **Crear Pull Request**

### Estándares de Código

- ESLint para JavaScript/TypeScript
- Prettier para formateo
- Conventional Commits para mensajes

## 📞 Soporte

### Contacto
- **Email**: soporte@cowtracker.cl
- **GitHub Issues**: [Reportar Bug](https://github.com/lucassmelendez/CowTracker/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/lucassmelendez/CowTracker/wiki)

### FAQ

**P: ¿Cómo actualizo a Premium?**
R: Desde el perfil de usuario, presiona "Actualizar a Premium" y sigue el proceso de pago.

**P: ¿Los datos están seguros?**
R: Sí, usamos Supabase con encriptación y cumplimos estándares de seguridad.

**P: ¿Funciona offline?**
R: Funcionalidades básicas sí, pero se requiere conexión para sincronización.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🏆 Créditos

### Desarrollado por
- **Lucas Meléndez** - Desarrollo Full Stack
- **Universidad** - Proyecto de Portafolio Final

### Tecnologías Utilizadas
- React Native & Expo
- Node.js & Express.js
- FastAPI & Python
- Supabase & PostgreSQL
- Webpay Plus (Transbank)
- Banco Central de Chile API

---

<div align="center">
  <strong>🐄 CowTracker - Gestión Inteligente de Ganado 🐄</strong>
  <br>
  <em>Desarrollado con ❤️ para la industria ganadera chilena</em>
</div> 