# Nombre de la Aplicación React Native

Breve descripción de tu aplicación React Native. Explica para qué sirve y qué funcionalidades principales ofrece.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [npm](https://www.npmjs.com/) (normalmente viene con Node.js)
- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) (versión 17)
- Un dispositivo Android físico 

## 🚀 Instalación y Configuración

Sigue estos pasos para instalar y ejecutar la aplicación en tu dispositivo Android:

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la dirección IP

Abre el archivo `App.tsx` y busca la línea donde se define la URL de la API. Cambia la dirección IP por la de tu computadora:

```javascript
// Ejemplo: Cambia esta línea
const API_URL = 'http://192.168.1.100:3000';

// Por la IP de tu computadora en la red local
const API_URL = 'http://192.168.1.50:3000'; // <- Usa tu IP aquí
```

**Nota:** Para encontrar tu dirección IP:
- Windows: Ejecuta `ipconfig` en la terminal y busca "Dirección IPv4"
- macOS/Linux: Ejecuta `ifconfig` o `ip addr show`

### 4. Iniciar Metro Bundler

En una terminal, ejecuta:

```bash
npm start
```

Esto iniciará el servidor de desarrollo de React Native (Metro). Mantén esta terminal abierta.

### 5. Iniciar el servidor API

Abre una NUEVA terminal y navega a la carpeta de la API:

```bash
cd services/api
node server.js
```

El servidor API debería iniciarse y estar disponible en la dirección IP que configuraste en el paso 3.

### 6. Ejecutar la aplicación en Android

Abre una NUEVA terminal (con el Metro Bundler y el servidor API aún ejecutándose) y ejecuta:

```bash
npx react-native run-android
```

**Importante:** 
- Asegúrate de tener un dispositivo Android conectado por USB con la depuración USB habilitada.
- O tener un emulador de Android ejecutándose.

## 🔧 Configuración de Dispositivo Android

Si usas un dispositivo físico:

1. Habilita las "Opciones de desarrollador" en tu Android:
   - Ve a Ajustes > Acerca del teléfono
   - Toca "Número de compilación" 7 veces
   
2. En Opciones de desarrollador, habilita "Depuración USB"

3. Conecta tu dispositivo via USB y acepta la solicitud de depuración cuando aparezca

## 🐛 Solución de Problemas

### Error: "SDK location not found"
- Asegúrate de que la variable de entorno ANDROID_HOME está configurada correctamente

### La aplicación no se conecta al servidor API
- Verifica que la IP en App.tsx es correcta
- Asegúrate de que el servidor API está ejecutándose
- Comprueba que ambos dispositivos (PC y teléfono) están en la misma red

### Error al ejecutar npm install
- Intenta eliminar la carpeta node_modules y package-lock.json y ejecuta npm install again

## 📝 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo Metro
- `npx react-native run-android` - Ejecuta la aplicación en Android
- `npm test` - Ejecuta las pruebas
- `npm run lint` - Ejecuta el linter para verificar la calidad del código

## 📞 Soporte

Si tienes problemas para configurar o ejecutar la aplicación, por favor:

1. Revisa la documentación de [React Native](https://reactnative.dev/docs/getting-started)
2. Comprueba que todos los prerrequisitos están instalados correctamente
3. Abre un issue en este repositorio describiendo el problema encontrado

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.