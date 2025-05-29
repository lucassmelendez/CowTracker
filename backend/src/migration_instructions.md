# Instrucciones para Migrar de Firebase a Supabase

Este documento contiene los pasos necesarios para migrar la aplicación CowTracker de Firebase a Supabase.

## Requisitos previos

1. Cuenta en Supabase con un proyecto creado
2. Node.js instalado (v14 o superior)
3. Acceso al proyecto de Firebase actual

## Paso 1: Configuración de variables de entorno

Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```
# Firebase (mantener para la migración)
FIREBASE_PROJECT_ID=cowtracker-1f58a
FIREBASE_PRIVATE_KEY=tu-clave-privada-de-firebase
FIREBASE_CLIENT_EMAIL=tu-email-cliente-de-firebase
FIREBASE_DATABASE_URL=https://cowtracker-1f58a.firebaseio.com

# Supabase
SUPABASE_URL=https://eisceuexbwpdpjxuskgz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2NldWV4YndwZHBqeHVza2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTM3MzgsImV4cCI6MjA2NDEyOTczOH0.B-xDkrbShC76GwQ1p4poZzdcppxh1u95s24XRz185KE
SUPABASE_SERVICE_KEY=tu-clave-de-servicio-de-supabase
```

## Paso 2: Crear estructura de la base de datos en Supabase

1. Inicia sesión en tu proyecto de Supabase
2. Ve a la sección "SQL Editor"
3. Crea una nueva consulta
4. Copia el contenido del archivo `backend/src/sql/supabase_schema.sql`
5. Ejecuta la consulta para crear el esquema de la base de datos

## Paso 3: Habilitar extensiones necesarias en Supabase

1. En tu proyecto de Supabase, ve a "Database" > "Extensions"
2. Habilita las siguientes extensiones:
   - `uuid-ossp` (para generar UUIDs)
   - `pg_crypto` (para funciones de encriptación)

## Paso 4: Migrar datos

### Opción 1: Migración automática (recomendada para desarrollo)

1. Ejecuta el script de migración:
   ```
   cd backend
   node src/scripts/migrate_to_supabase.js
   ```

2. Sigue las instrucciones en la consola. Es posible que necesites crear manualmente algunos usuarios en Supabase Auth.

### Opción 2: Migración manual (recomendada para producción)

1. Exporta los datos de Firebase usando la consola de Firebase o herramientas de exportación
2. Formatea los datos según el esquema de Supabase
3. Importa los datos usando el SQL Editor de Supabase o la API

## Paso 5: Actualizar la aplicación para usar Supabase

1. Reemplaza los modelos de Firebase por los nuevos modelos de Supabase:
   - Usa `supabaseUserModel.js` en lugar de `firebaseUserModel.js`
   - Usa `supabaseGanadoModel.js` en lugar de `cattleModel.js`
   - Usa `supabaseFincaModel.js` en lugar de `farmModel.js`

2. Actualiza los servicios para usar Supabase:
   - Usa `supabaseAuthService.js` en lugar de `authService.js`

3. Actualiza el middleware de autenticación para verificar tokens de Supabase

## Paso 6: Actualizar la aplicación móvil

1. Agrega las dependencias de Supabase en el frontend:
   ```
   npm install @supabase/supabase-js
   ```

2. Actualiza los archivos de configuración para usar las variables de entorno de Supabase:
   ```javascript
   // En app.json o .env
   EXPO_PUBLIC_SUPABASE_URL=https://eisceuexbwpdpjxuskgz.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2NldWV4YndwZHBqeHVza2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTM3MzgsImV4cCI6MjA2NDEyOTczOH0.B-xDkrbShC76GwQ1p4poZzdcppxh1u95s24XRz185KE
   ```

## Resolución de problemas comunes

### Problema: Los tokens de autenticación no funcionan

Asegúrate de que estás utilizando el formato correcto para los tokens de Supabase. Los tokens JWT de Supabase tienen un formato diferente a los de Firebase.

### Problema: Las relaciones entre tablas no funcionan correctamente

Verifica que las claves foráneas estén correctamente configuradas en el esquema. En Supabase, las relaciones se definen explícitamente con claves foráneas.

### Problema: Los triggers o políticas RLS no funcionan

Verifica que los triggers y políticas RLS estén correctamente configurados en Supabase. Puedes revisarlos desde la interfaz de Supabase en "Database" > "Policies".

## Notas importantes

1. **Seguridad**: Supabase utiliza Row Level Security (RLS) para controlar el acceso a los datos. Asegúrate de configurar correctamente las políticas de seguridad.

2. **Autenticación**: Supabase Auth maneja la autenticación de manera diferente a Firebase Auth. Familiarízate con los métodos de autenticación de Supabase.

3. **Consultas en tiempo real**: Si tu aplicación utiliza escuchas en tiempo real de Firebase, deberás actualizarlas para usar las suscripciones en tiempo real de Supabase.

4. **Almacenamiento**: Si estás utilizando Firebase Storage, considera migrar a Supabase Storage.

## Recursos adicionales

- [Documentación oficial de Supabase](https://supabase.io/docs)
- [Guía de migración de Firebase a Supabase](https://supabase.io/docs/guides/migrations/firebase-to-supabase)
- [Ejemplos de API de Supabase](https://github.com/supabase/supabase/tree/master/examples)
- [Plantillas de políticas RLS](https://supabase.io/docs/guides/auth/row-level-security) 