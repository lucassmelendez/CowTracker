# Backend de CowTracker con Supabase

Este proyecto ha sido migrado de Firebase a Supabase. Este README contiene instrucciones para configurar y ejecutar el backend.

## Requisitos

- Node.js v14 o superior
- Cuenta en Supabase con un proyecto creado

## Configuración

1. Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

```
# Supabase
SUPABASE_URL=https://eisceuexbwpdpjxuskgz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2NldWV4YndwZHBqeHVza2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTM3MzgsImV4cCI6MjA2NDEyOTczOH0.B-xDkrbShC76GwQ1p4poZzdcppxh1u95s24XRz185KE
SUPABASE_SERVICE_KEY=tu-clave-de-servicio-de-supabase

# Variables para Expo/Frontend
EXPO_PUBLIC_SUPABASE_URL=https://eisceuexbwpdpjxuskgz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2NldWV4YndwZHBqeHVza2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTM3MzgsImV4cCI6MjA2NDEyOTczOH0.B-xDkrbShC76GwQ1p4poZzdcppxh1u95s24XRz185KE

# Configuración del servidor
PORT=5000
NODE_ENV=production
```

2. Instala las dependencias:

```
npm install
```

3. Ejecuta el script SQL para crear el esquema en Supabase:
   - Abre tu proyecto en Supabase
   - Ve a "SQL Editor"
   - Crea una nueva consulta
   - Copia y pega el contenido de `src/sql/supabase_schema.sql`
   - Ejecuta la consulta

## Ejecución del servidor

Para ejecutar el servidor en modo desarrollo:

```
npm run dev
```

Para ejecutar el servidor en producción:

```
npm start
```

## Migración de datos

Si necesitas migrar datos de Firebase a Supabase, puedes usar el script de migración:

```
node src/scripts/migrate_to_supabase.js
```

Para más detalles sobre el proceso de migración, consulta el archivo `src/migration_instructions.md`.

## Estructura de archivos principales

- `src/config/supabase.js` - Configuración de Supabase
- `src/models/` - Modelos para interactuar con Supabase
  - `supabaseUserModel.js` - Modelo de usuarios
  - `supabaseGanadoModel.js` - Modelo de ganado
  - `supabaseFincaModel.js` - Modelo de fincas
- `src/services/` - Servicios para operaciones complejas
  - `supabaseAuthService.js` - Servicio de autenticación
  - `supabaseService.js` - Servicio centralizado para operaciones con Supabase
- `src/controllers/` - Controladores para manejar solicitudes HTTP
- `src/routes/` - Rutas de la API
- `src/middlewares/` - Middlewares para autenticación y validación

## Notas importantes

1. Si encuentras errores relacionados con rutas o importaciones, asegúrate de que estás utilizando las versiones correctas de los archivos (los que tienen prefijo "supabase").

2. Si aparecen errores con los middlewares, revisa que estés utilizando `supabaseAuthMiddleware.js` en lugar de `authMiddleware.js`.

3. Recuerda actualizar las variables de entorno en tu frontend para que utilice Supabase en lugar de Firebase. 