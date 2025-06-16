# 🐄 CowTracker - Sistema de Gestión de Ganado

[![React Native](https://img.shields.io/badge/React%20Native-0.79.3-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.9-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-orange.svg)](https://supabase.com/)
[![Webpay Plus](https://img.shields.io/badge/Webpay%20Plus-Payments-red.svg)](https://www.transbank.cl/)

## 📋 Descripción

AgroControl es una aplicación móvil multiplataforma desarrollada con React Native y Expo para la gestión integral de ganado bovino. Permite a ganaderos, veterinarios y administradores llevar un control completo de su ganado, granjas, registros veterinarios, ventas y realizar pagos seguros para funcionalidades premium.

### ✨ Características Principales

#### 🐮 **Gestión Integral de Ganado**
- Registro completo de animales con información detallada
- Identificación única con números y códigos QR
- Control de estado de salud y género
- Historial completo de cada animal
- Escáner QR integrado para identificación rápida

#### 🏡 **Administración de Granjas**
- Control de múltiples ubicaciones
- Gestión de tamaño y capacidad
- Asignación de ganado por granja
- Reportes por ubicación

#### 🏥 **Registros Veterinarios Avanzados**
- Historial médico completo
- Registro de tratamientos y diagnósticos
- Seguimiento de fechas de tratamiento
- Notas detalladas por veterinario
- Exportación de reportes médicos

#### 💰 **Sistema de Ventas**
- Venta de ganado con precios automáticos
- Venta de leche con control de litros
- Historial completo de transacciones
- Reportes de ingresos y estadísticas
- Edición y seguimiento de ventas

#### 💳 **Pagos Webpay Plus**
- Integración con sistema de pagos chileno
- Procesamiento seguro de transacciones
- Conversión automática CLP/USD
- Activación de funcionalidades premium

#### 💎 **Sistema Premium**
- Funcionalidades avanzadas con suscripción
- Ganado y granjas ilimitadas
- Reportes detallados con gráficos
- Exportación a PDF/Excel
- Soporte prioritario

#### 📊 **Reportes y Estadísticas**
- Dashboard con métricas clave
- Gráficos de producción de leche
- Estadísticas de ventas
- Reportes de salud del ganado
- Análisis de rentabilidad

#### 👥 **Sistema Multi-Usuario**
- Roles diferenciados (Admin, Veterinario, Trabajador, Usuario)
- Autenticación segura con Supabase
- Control de permisos por funcionalidad
- Gestión de usuarios desde panel admin

#### 📱 **Experiencia de Usuario**
- Interfaz moderna y intuitiva
- Soporte para web, iOS y Android
- Modo offline para funciones básicas
- Sincronización automática
- Notificaciones push

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend APIs  │    │   Servicios     │
│   React Native  │◄──►│   Express.js    │◄──►│   Supabase      │
│   Expo Router   │    │   REST API      │    │   PostgreSQL    │
│   TypeScript    │    │                 │    │   Auth & RT     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│   FastAPI       │◄─────────────┘
                        │   Webpay Plus   │
                        │   Banco Central │
                        │   Conversión $  │
                        └─────────────────┘
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18 o superior
- **npm** o **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

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
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Backend APIs
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_FASTAPI_URL=https://ct-fastapi.vercel.app

# App Configuration
EXPO_PUBLIC_APP_NAME=CowTracker
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 4. Iniciar el Proyecto

```bash
# Iniciar en modo desarrollo
npx expo start

# Iniciar solo para web
npx expo start --web

# Iniciar para dispositivos específicos
npx expo start --ios
npx expo start --android
```

### 5. Acceso a la Aplicación

- **Web**: Presiona `w` en la consola o abre `http://localhost:8081`
- **iOS**: Escanea el QR con la app Expo Go
- **Android**: Escanea el QR con la app Expo Go

## 🌐 Servicios y APIs

### Backend Express.js
- **URL Local**: `http://localhost:5000`
- **Funciones**: Autenticación, CRUD completo, gestión de usuarios
- **Endpoints**: Ganado, granjas, veterinaria, ventas, usuarios

### FastAPI (Webpay + Conversión)
- **URL Producción**: `https://ct-fastapi.vercel.app`
- **Funciones**: 
  - Procesamiento de pagos con Webpay Plus
  - Conversión de moneda en tiempo real
  - Integración con Banco Central de Chile

### Base de Datos Supabase
- **Tipo**: PostgreSQL en la nube
- **Funciones**: 
  - Almacenamiento de datos persistente
  - Autenticación de usuarios
  - Tiempo real y sincronización
  - Políticas de seguridad RLS

## 💳 Sistema de Pagos

### Webpay Plus Integration

```javascript
// Proceso de pago premium
const initiatePayment = async () => {
  const paymentData = {
    amount: 10000, // $10.000 CLP
    buy_order: `premium_upgrade_${Date.now()}`,
    session_id: `session_${userId}`,
    return_url: 'http://localhost:8081/premium/activate'
  };
  
  const response = await fetch(`${FASTAPI_URL}/webpay/create`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
};
```

### Conversión de Moneda Automática

```javascript
// Endpoint de conversión en tiempo real
GET /currency/convert?amount=10000&from_currency=CLP&to_currency=USD

// Respuesta con formato amigable
{
  "original_amount": 10000,
  "converted_amount": 11.23,
  "from_currency": "CLP",
  "to_currency": "USD",
  "exchange_rate": 0.001123,
  "formatted": {
    "combined": "$10,000 CLP / $11.23 USD",
    "separate": {
      "clp": "$10,000",
      "usd": "$11.23"
    }
  }
}
```

## 📱 Funcionalidades Detalladas

### 🆓 Versión Gratuita
- ✅ Registro hasta **2 cabezas de ganado**
- ✅ **1 granja** con información básica
- ✅ Registros veterinarios básicos
- ✅ Autenticación y perfil de usuario
- ✅ Escáner QR básico
- ✅ Reportes simplificados

### 💎 Versión Premium ($10.000 CLP / ~$11 USD)
- ✅ **Ganado ilimitado** con información completa
- ✅ **Granjas ilimitadas** con gestión avanzada
- ✅ Registros veterinarios detallados
- ✅ **Sistema completo de ventas** (ganado + leche)
- ✅ **Reportes avanzados** con gráficos interactivos
- ✅ **Exportación** a Excel/PDF
- ✅ **Dashboard administrativo** completo
- ✅ Soporte prioritario y actualizaciones premium
- ✅ Sincronización en la nube sin límites
- ✅ **Análisis de rentabilidad** y estadísticas

### 🔧 Funcionalidades Técnicas

#### Escáner QR Integrado
- Identificación rápida de ganado
- Generación automática de códigos QR
- Soporte para múltiples formatos

#### Sistema de Roles
```typescript
enum UserRole {
  ADMIN = 'admin',          // Acceso completo al sistema
  VETERINARIO = 'vet',      // Acceso a registros médicos
  TRABAJADOR = 'worker',    // Operaciones diarias
  USUARIO = 'user'          // Funcionalidades básicas
}
```

#### Offline Support
- Almacenamiento local con AsyncStorage
- Sincronización automática al conectarse
- Funciones críticas disponibles sin internet

## 🗄️ Estructura de Base de Datos

### Esquema Principal de Tablas

```sql
-- Gestión de Usuarios
CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  primer_nombre VARCHAR(50) NOT NULL,
  segundo_nombre VARCHAR(50),
  primer_apellido VARCHAR(50) NOT NULL,
  segundo_apellido VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  id_rol INTEGER REFERENCES rol(id_rol),
  id_premium INTEGER REFERENCES premium(id_premium) DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE
);

-- Gestión de Ganado
CREATE TABLE ganado (
  id_ganado SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  numero_identificacion VARCHAR(50) UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  peso_actual DECIMAL(6,2),
  nota TEXT,
  id_finca INTEGER REFERENCES finca(id_finca),
  id_estado_salud INTEGER REFERENCES estado_salud(id_estado_salud),
  id_genero INTEGER REFERENCES genero(id_genero),
  id_usuario INTEGER REFERENCES usuario(id_usuario),
  fecha_registro TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE
);

-- Gestión de Granjas
CREATE TABLE finca (
  id_finca SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ubicacion VARCHAR(200),
  tamano DECIMAL(10,2), -- en hectáreas
  capacidad_ganado INTEGER,
  id_usuario INTEGER REFERENCES usuario(id_usuario),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  activa BOOLEAN DEFAULT TRUE
);

-- Registros Veterinarios
CREATE TABLE informacion_veterinaria (
  id_informacion_veterinaria SERIAL PRIMARY KEY,
  id_ganado INTEGER REFERENCES ganado(id_ganado),
  fecha_tratamiento DATE NOT NULL,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT NOT NULL,
  medicamento VARCHAR(200),
  dosis VARCHAR(100),
  veterinario_nombre VARCHAR(100),
  proximo_control DATE,
  nota TEXT,
  id_usuario INTEGER REFERENCES usuario(id_usuario),
  fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Sistema de Ventas
CREATE TABLE venta (
  id_venta SERIAL PRIMARY KEY,
  tipo_venta VARCHAR(20) CHECK (tipo_venta IN ('ganado', 'leche')),
  id_ganado INTEGER REFERENCES ganado(id_ganado), -- NULL para venta de leche
  cantidad DECIMAL(10,2), -- unidades o litros
  precio_unitario DECIMAL(10,2),
  precio_total DECIMAL(10,2),
  comprador VARCHAR(200),
  fecha_venta DATE NOT NULL,
  notas TEXT,
  id_usuario INTEGER REFERENCES usuario(id_usuario),
  fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Control Premium
CREATE TABLE premium (
  id_premium SERIAL PRIMARY KEY,
  descripcion VARCHAR(50) NOT NULL, -- 'Free', 'Premium'
  limite_ganado INTEGER, -- NULL = ilimitado
  limite_granjas INTEGER, -- NULL = ilimitado
  acceso_reportes BOOLEAN DEFAULT FALSE,
  acceso_exportacion BOOLEAN DEFAULT FALSE,
  precio_clp DECIMAL(10,2),
  activo BOOLEAN DEFAULT TRUE
);
```

### Relaciones Clave
- **Usuario ↔ Ganado**: Un usuario puede tener múltiple ganado
- **Usuario ↔ Finca**: Un usuario puede administrar múltiples granjas
- **Ganado ↔ Finca**: Cada animal pertenece a una granja específica
- **Ganado ↔ Veterinaria**: Historial médico completo por animal
- **Usuario ↔ Ventas**: Tracking completo de transacciones

## 🔧 Scripts y Comandos

### Scripts de Desarrollo
```bash
# Desarrollo
npm start                    # Inicia Expo development server
npx expo start --web         # Solo navegador web
npx expo start --ios         # Solo simulador iOS
npx expo start --android     # Solo emulador Android
npx expo start --clear       # Limpiar cache y iniciar

# Construcción y Deploy
npx expo build:web           # Build para producción web
npx expo export              # Exportar para hosting estático

# Utilidades
npm run type-check           # Verificar tipos TypeScript
npm run clean                # Limpiar node_modules y cache
```

### Scripts de Base de Datos
```bash
# Migrations (si usas Supabase CLI)
supabase db push             # Aplicar cambios a la DB
supabase db reset            # Resetear DB a estado inicial
supabase gen types typescript # Generar tipos TypeScript
```

## 🌍 Despliegue

### Frontend (React Native/Expo)
```bash
# Desarrollo
npx expo start

# Web (Netlify/Vercel)
npx expo export:web
# Subir carpeta dist/ a hosting

# App Stores (EAS Build)
npm install -g eas-cli
eas build --platform all
eas submit --platform all
```

### Backend APIs
- **Express.js**: Railway, Render, o VPS
- **FastAPI**: Vercel (configuración actual)
- **Base de Datos**: Supabase (managed PostgreSQL)

### URLs de Producción
- **Frontend Web**: A definir según hosting
- **FastAPI**: `https://ct-fastapi.vercel.app`
- **Supabase**: Panel de administración automático

## 🔐 Seguridad y Autenticación

### Supabase Auth
```typescript
// Configuración de autenticación
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// Row Level Security (RLS)
// Los usuarios solo pueden ver sus propios datos
CREATE POLICY "Users can view own cattle" ON ganado
  FOR SELECT USING (auth.uid() = id_usuario);
```

### Roles y Permisos
| Rol | Ganado | Granjas | Veterinaria | Ventas | Admin |
|-----|--------|---------|-------------|---------|-------|
| Usuario | ✅ Propio | ✅ Propio | ✅ Propio | ✅ Propio | ❌ |
| Trabajador | ✅ Asignado | ✅ Asignado | ✅ Lectura | ✅ Registro | ❌ |
| Veterinario | ✅ Lectura | ✅ Lectura | ✅ Completo | ❌ | ❌ |
| Admin | ✅ Completo | ✅ Completo | ✅ Completo | ✅ Completo | ✅ |

## 📊 Monitoreo y Analytics

### Logging
- **Frontend**: Expo crash reporting automático
- **FastAPI**: Logs estructurados en Vercel
- **Supabase**: Dashboard de métricas integrado

### Métricas Clave
- Usuarios activos diarios/mensuales
- Conversiones a Premium
- Uso de funcionalidades por rol
- Performance de APIs
- Errores y crashes


#### Estructura de Archivos
```
app/
├── (tabs)/              # Pantallas principales
│   ├── index.tsx        # Dashboard principal
│   ├── cattle/          # Gestión de ganado
│   ├── farms/           # Gestión de granjas
│   ├── reports/         # Reportes y análisis
│   └── profile/         # Perfil de usuario
├── components/          # Componentes reutilizables
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuración
├── constants/          # Constantes de la app
└── types/              # Definiciones TypeScript
``` 

### Stack Tecnológico Completo

#### Frontend
- **React Native** 0.79.3 - Framework principal
- **Expo** 53.0.9 - Plataforma de desarrollo
- **TypeScript** 5.3.3 - Tipado estático
- **Expo Router** - Navegación basada en archivos
- **React Navigation** - Navegación avanzada

#### Backend & APIs
- **Node.js** + **Express.js** - API REST principal
- **FastAPI** + **Python** - Microservicios de pago
- **Supabase** - BaaS (Backend as a Service)
- **PostgreSQL** - Base de datos relacional

#### Servicios Externos
- **Webpay Plus** (Transbank) - Procesamiento de pagos
- **Banco Central de Chile** - Conversión de moneda
- **Expo Application Services** - Build y deployment
