# Sistema de Gestión para Peluquerías 💇‍♀️✂️

Aplicación móvil **genérica y configurable** para la gestión integral de peluquerías y negocios similares.  
Al iniciar la app, cada usuario ingresa el **nombre de su peluquería** y su **logo**, personalizando automáticamente la aplicación para su negocio.

La aplicación está diseñada bajo el enfoque **offline-first**, lo que permite utilizar todas sus funcionalidades sin conexión a internet.

---

## 📱 Funcionalidades

### 👥 Gestión de Clientes
- Registro y edición de clientes
- Almacenamiento de nombre y teléfono
- Historial de servicios realizados

### 📅 Calendario y Turnos
- Calendario para **agendar turnos**
- Asignación de clientes, fecha y horario
- Visualización clara de la agenda diaria y semanal

### 🔔 Recordatorios automáticos
- Envío de **recordatorios de turnos por WhatsApp**
- Reducción de ausencias y cancelaciones

### 📦 Gestión de Stock
- Registro de productos e insumos
- Control de cantidades disponibles
- Seguimiento básico del consumo

### 💾 Backups manuales
- Exportación manual de los datos
- Prevención de pérdida de información
- Ideal para cambios de dispositivo o resguardo externo

### 🗄️ Base de Datos Local
- Almacenamiento persistente mediante **SQLite**
- Funcionamiento completo sin conexión a internet
- Datos seguros en el dispositivo

### 🎨 Personalización
- Nombre del negocio configurable
- Logo propio de la peluquería
- Interfaz clara y pensada para uso diario

---

## 🛠️ Tecnologías

- **React Native** – Desarrollo móvil multiplataforma
- **Expo** (~54.0.0) – Entorno de desarrollo y build
- **TypeScript** – Tipado estático para JavaScript
- **Expo SQLite** – Base de datos local
- **React Navigation** – Navegación entre pantallas
- **Expo FileSystem** – Manejo de archivos y backups
- **React Native Safe Area Context** – Manejo de áreas seguras

---

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Expo CLI (opcional)
- Aplicación **Expo Go** instalada en el dispositivo (para desarrollo)

---

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/CornejoMateo/hairsalon.git
cd hairsalon

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Expo CLI instalado globalmente (opcional)
- Expo Go app en tu dispositivo móvil (para desarrollo)

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/CornejoMateo/hairsalon.git
cd hairsalon
```

2. Instala las dependencias:
```bash
npm install
```

## 💻 Ejecución

### Modo desarrollo

Inicia el servidor de desarrollo:
```bash
npm start
```

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

Escanea el código QR con la app Expo Go (Android) o la cámara del iPhone para ejecutar en tu dispositivo.

```
## 📄 Licencia

Este proyecto es privado.

## 👤 Autor

**Mateo Cornejo**
- GitHub: [@CornejoMateo](https://github.com/CornejoMateo)
