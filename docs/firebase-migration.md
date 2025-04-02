# Migración de Firebase al Backend

## Resumen

Este documento detalla la migración de las configuraciones y servicios de Firebase desde el frontend al backend, mejorando la seguridad y mantenibilidad de la aplicación CowTracker.

## Cambios realizados

### 1. Configuración de Firebase

- **Archivos de configuración migrados:**
  - `.firebaserc`
  - `firebase.json`
  - `firestore.indexes.json`
  - `firestore.rules`
  - `google-services.json`
  - `serviceAccountKey.json`

- **Nueva ubicación:** `backend/firebase-config/`

- **Archivos sensibles protegidos:**
  - `serviceAccountKey.json` añadido a `.gitignore`

### 2. Autenticación

- Se eliminó la dependencia directa de Firebase Authentication en el frontend
- Se implementó un sistema de autenticación basado en API REST
- Se mantuvieron las mismas funcionalidades (registro, inicio de sesión, verificación de token)
- El token JWT se almacena localmente utilizando AsyncStorage

### 3. Servicios de datos

- Se reemplazó Firestore.js por llamadas a la API del backend
- Las operaciones CRUD ahora pasan por el backend
- Se mantiene la misma estructura de datos y funcionalidades

### 4. Configuración del backend

- Se actualizó `backend/src/config/firebase.js` para referenciar la nueva ubicación de los archivos
- Se añadieron scripts de Firebase a `backend/package.json`

## Beneficios de la migración

1. **Mayor seguridad:** Las claves API y credenciales sensibles ahora están protegidas en el servidor
2. **Mejor arquitectura:** Separación clara entre frontend y backend
3. **Mayor control:** Mayor capacidad para implementar lógica de negocio y validaciones
4. **Simplificación del frontend:** El frontend ahora se centra en la interfaz de usuario

## Pruebas

Todas las funcionalidades se han probado para asegurar que sigan funcionando correctamente:
- Autenticación (registro, inicio de sesión, cierre de sesión)
- Gestión de granjas
- Gestión de ganado
- Gestión de usuarios (trabajadores, veterinarios) 