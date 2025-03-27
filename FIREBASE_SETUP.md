# Configuración de Firebase en CowTracker para React Native

Este documento proporciona instrucciones para configurar Firebase en la aplicación móvil CowTracker desarrollada con React Native para Android e iOS.

## Requisitos previos

1. Tener una cuenta de Google
2. Acceso a la [Consola de Firebase](https://console.firebase.google.com/)
3. Tener instalado React Native CLI o Expo
4. Tener configurado el entorno de desarrollo para Android (Android Studio) e iOS (Xcode, solo en macOS)

## Pasos para configurar Firebase

### 1. Crear un proyecto en Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Haz clic en "Añadir proyecto"
3. Ingresa "CowTracker" como nombre del proyecto
4. Sigue los pasos para crear el proyecto (puedes habilitar Google Analytics si lo deseas)

### 2. Registrar tus aplicaciones en Firebase

#### Para Android:

1. En la página de inicio del proyecto, haz clic en el icono de Android para añadir una aplicación Android
2. Registra la aplicación con el ID del paquete (normalmente algo como `com.tuempresa.cowtracker`)
3. Descarga el archivo `google-services.json`
4. Coloca este archivo en la carpeta `android/app` de tu proyecto React Native

#### Para iOS:

1. En la página de inicio del proyecto, haz clic en el icono de iOS para añadir una aplicación iOS
2. Registra la aplicación con el Bundle ID (normalmente algo como `com.tuempresa.cowtracker`)
3. Descarga el archivo `GoogleService-Info.plist`
4. Coloca este archivo en la carpeta principal de tu proyecto iOS (puedes usar Xcode para añadirlo)

### 3. Configurar Firebase en la aplicación React Native

#### 3.1 Instalar dependencias necesarias

Las dependencias ya están instaladas en el proyecto según el package.json, pero si necesitas instalarlas manualmente, ejecuta:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

#### 3.2 Configurar el archivo de Firebase

1. Abre el archivo `src/config/firebase.js`
2. Actualiza el archivo para usar las dependencias de React Native Firebase:

```javascript
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// La configuración se carga automáticamente desde los archivos nativos
// google-services.json (Android) y GoogleService-Info.plist (iOS)

// Verificar si Firebase ya está inicializado
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp({});
} else {
  app = firebase.app();
}

// Obtener servicios de Firebase
const auth = firebase.auth();
const firestore = firebase.firestore();

export { auth, firestore };
```
```

### 4. Habilitar la autenticación por correo electrónico y contraseña

1. En la consola de Firebase, ve a "Authentication" en el menú lateral
2. Haz clic en "Get started" o "Comenzar"
3. Selecciona "Email/Password" (Correo electrónico/contraseña)
4. Habilita la opción "Email/Password"
5. Guarda los cambios

### 5. Configurar Firestore Database

1. En la consola de Firebase, ve a "Firestore Database" en el menú lateral
2. Haz clic en "Create database" o "Crear base de datos"
3. Selecciona "Start in test mode" o "Comenzar en modo de prueba" (podrás configurar reglas de seguridad más adelante)
4. Selecciona la ubicación del servidor más cercana a tus usuarios
5. Haz clic en "Enable" o "Habilitar"

### 6. Reglas de seguridad básicas para Firestore

Una vez que hayas configurado Firestore, puedes establecer reglas de seguridad básicas. Ve a la pestaña "Rules" o "Reglas" y reemplaza las reglas existentes por estas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas específicas para la colección de ganado
    match /cattle/{cattleId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Reglas para registros médicos
    match /medicalRecords/{recordId} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas para granjas
    match /farms/{farmId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Estructura de datos en Firestore

La aplicación utiliza las siguientes colecciones en Firestore:

1. **cattle**: Almacena la información del ganado
   - Campos: nombre, raza, peso, edad, estado, userId, etc.

2. **medicalRecords**: Almacena los registros médicos del ganado
   - Campos: cattleId, fecha, descripción, tratamiento, etc.

3. **farms**: Almacena la información de las granjas
   - Campos: nombre, ubicación, tamaño, userId, etc.

### 7. Configuración adicional para Android e iOS

#### Para Android:

1. Abre el archivo `android/build.gradle` y asegúrate de que tienes el siguiente repositorio:

```gradle
buildscript {
  repositories {
    // ...
    google()  // Asegúrate de que esta línea esté presente
  }
  dependencies {
    // ...
    classpath 'com.google.gms:google-services:4.3.15'  // Añade esta línea
  }
}
```

2. Abre el archivo `android/app/build.gradle` y añade al final:

```gradle
apply plugin: 'com.google.gms.google-services'  // Añade esta línea al final
```

#### Para iOS:

1. Asegúrate de tener CocoaPods instalado
2. Ejecuta `cd ios && pod install && cd ..` para instalar las dependencias nativas

## Solución de problemas comunes

1. **Error de autenticación**: Asegúrate de que has habilitado correctamente la autenticación por correo electrónico y contraseña en la consola de Firebase.

2. **Error de permisos en Firestore**: Verifica las reglas de seguridad de Firestore y asegúrate de que los usuarios autenticados tienen los permisos necesarios.

3. **Error de inicialización de Firebase**: Verifica que has colocado correctamente los archivos `google-services.json` y `GoogleService-Info.plist` en las ubicaciones adecuadas.

4. **Errores de compilación en Android**: Asegúrate de que has añadido el plugin de Google Services en los archivos gradle correctos.

5. **Errores de compilación en iOS**: Ejecuta `cd ios && pod install` para asegurarte de que todas las dependencias nativas están instaladas correctamente.

## Recursos adicionales

- [Documentación de React Native Firebase](https://rnfirebase.io/)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de autenticación de Firebase para React Native](https://rnfirebase.io/auth/usage)
- [Guía de Firestore para React Native](https://rnfirebase.io/firestore/usage)