# 🎨 Control de Obras - Frontend Web Application

Aplicación web desarrollada en **React**, **TypeScript** y **Vite** para la gestión operativa y seguimiento visual de **Control de Obras**. Proporciona interfaces intuitivas para el control de estados de obras, seguimiento de contratos, generación de bitácoras/oficios, importación masiva de datos desde Excel, mapas geoespaciales y reportes técnicos.

---

## 🛠️ Tecnologías y Librerías

* **Core & Build Tool:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **UI Components & Icons:** [@mui/material](https://mui.com/), `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
* **Navegación:** [React Router DOM v6](https://reactrouter.com/)
* **Mapas Geoespaciales:** [Leaflet](https://leafletjs.com/) (`react-leaflet`) para coordenadas X / Y
* **Formularios & Manejo de Estado:** `react-hook-form`
* **Procesamiento de Archivos:** `xlsx` (importación/exportación de archivos Excel)
* **Cliente HTTP:** [Axios](https://axios-http.com/)
* **Fechas:** `dayjs`, `@mui/x-date-pickers`

---

## 📋 Requisitos Previos

* **Node.js:** v18.x o superior
* **npm:** v9.x o superior
* **Backend running:** Servidor backend ejecutándose en `http://localhost:3000/api`

---

## 🚀 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
cd frontend
npm install
```

### 2. Variables de Entorno (`.env`)

Crea un archivo `.env` o `.env.local` en la raíz de la carpeta `frontend` si necesitas cambiar la URL base de la API backend:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 💻 Ejecución del Proyecto

```bash
# Modo Desarrollo (Hot-Reload)
npm run dev

# Compilar para Producción
npm run build

# Previsualizar Build de Producción
npm run preview
```

La aplicación se iniciará por defecto en `http://localhost:5173`.

---

## 📂 Estructura de Directorios

```text
frontend/
├── src/
│   ├── components/      # Componentes UI reutilizables (Modales, Tablas, Layouts, Cards)
│   ├── hooks/           # Custom React Hooks (Auth, API queries)
│   ├── layouts/         # Layout principal con navegación Sidebar y Header
│   ├── modules/         # Módulos funcionales del sistema:
│   │   ├── asignacion/       # Asignación de contratistas a obras por AT
│   │   ├── bitacoras/        # Bitácoras de campo, avisos MT y oficios
│   │   ├── capitalizacion/   # Control de obras capitalizadas
│   │   ├── configuracion/    # Configuración de notificaciones (SMTP / WhatsApp)
│   │   ├── contratos/        # Administración de contratos y estimaciones
│   │   ├── excelImport/      # Importación masiva desde Excel (.xlsx, .xlsb)
│   │   ├── mapa/             # Geolocalización de obras en mapa interactivo
│   │   ├── obras/            # ABCC de Obras (Pendientes, Asignadas, Terminadas)
│   │   ├── personal/         # Catálogo de personal técnico y supervisores
│   │   ├── reportes/         # Reportes exportables y estadísticas
│   │   └── zonas/            # Administración de zonas geográficas
│   ├── pages/           # Vistas principales integradas con el router
│   ├── routes/          # Definición de rutas protegidas y públicas
│   ├── services/        # Cliente Axios y servicios de API HTTP
│   └── styles/          # Estilos globales y temas visuales
├── index.html           # Punto de entrada HTML
├── vite.config.ts       # Configuración del bundler Vite
└── package.json
```

---

## 🌟 Funcionalidades Principales

1. **Dashboard y Gestión de Obras:**
   - Seguimiento del flujo de vida de una obra: `PENDIENTE` ➔ `ASIGNADA` ➔ `TERMINADA` ➔ `CAPITALIZADA`.
   - Búsqueda, filtrado y actualización rápida de ATs, Números de Oficio y Orden de Retiro.

2. **Gestión de Contratos y Estimaciones:**
   - Asignación de obras a contratistas con límite de montos.
   - Registro y control acumulado de estimaciones financieras.

3. **Bitácoras y Documentación Oficial:**
   - Generación e impresión de avisos de MT, oficios de salida de materiales y supervisiones de campo.

4. **Importador Masivo de Excel:**
   - Lectura rápida de archivos `.xlsx` y `.xlsb` para actualización masiva de folios y catálogos.

5. **Mapa Interactivo:**
   - Renderizado en mapa de las obras registradas utilizando sus coordenadas UTM (X, Y).
