# CowTracker

CowTracker es una aplicación para la gestión de ganado con React Native y Node.js.

## Estructura del Proyecto

El proyecto está organizado en dos partes principales:

- **Backend**: Servidor Node.js con Express que maneja la API REST y la conexión con Firebase
- **Frontend**: Aplicación React Native que proporciona la interfaz de usuario

## Requisitos

- Node.js 14 o superior
- npm o yarn
- Expo CLI (para el frontend)

## Configuración del Backend

1. Navega a la carpeta del backend:
   ```
   cd backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno copiando el archivo `.env.example` a `.env` y rellenando los valores:
   ```
   cp .env.example .env
   ```

4. Inicia el servidor:
   ```
   npm run dev
   ```

El servidor estará disponible en `http://localhost:5000`.

## Configuración del Frontend

1. Navega a la carpeta del frontend:
   ```
   cd frontend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Inicia la aplicación:
   ```
   npx expo start
   ```

## Despliegue

### Backend

El backend está configurado para ser desplegado en Vercel:

1. Instala Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Desde la carpeta del backend, ejecuta:
   ```
   vercel
   ```

3. Sigue las instrucciones para completar el despliegue.

4. Una vez desplegado, actualiza la URL de la API en el frontend en `frontend/src/config/api.js` cambiando `PRODUCTION_API_URL` y `IS_PRODUCTION`.

### Frontend

Para el frontend, puedes usar Expo para compilar la aplicación:

```
cd frontend
npx expo build:android
```

o

```
cd frontend
npx expo build:ios
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 