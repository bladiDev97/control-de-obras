# 🏗️ Control de Obras - Backend API

Servicio backend en **NestJS** para el sistema de **Control de Obras**. Administra el flujo completo de obras, contratos, estimaciones, asignaciones, bitácoras de campo, personal y áreas de trabajo, persistiendo la información en **AWS DynamoDB** (tanto en modo **Desarrollo** con DynamoDB Local como en **Producción** con AWS DynamoDB Cloud) a través de **TypeDORM**.

---

## 🛠️ Tecnologías y Arquitectura

* **Framework:** [NestJS](https://nestjs.com/) (Node.js con TypeScript)
* **Base de Datos:** AWS DynamoDB (Single-Table Design)
  * **Modo Desarrollo:** DynamoDB Local en `http://localhost:8000`
  * **Modo Producción:** AWS DynamoDB Cloud (Managed Service en AWS)
* **ORM / ODM:** [TypeDORM](https://github.com/typedorm/typedorm) (Data Mapper para DynamoDB)
* **SDK AWS:** `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb` v3
* **Seguridad y Auth:** JWT, Bcrypt, CryptoJS
* **Notificaciones:** MailService (Nodemailer SMTP) y WhatsApp Integration
* **Tareas Automatizadas:** Cron Jobs con `@nestjs/schedule` (Supervisión de obras vencidas)

---

## ⚙️ Configuración de Entornos (Desarrollo vs. Producción)

El backend soporta configuraciones dinámicas según el entorno mediante variables de entorno en `.env`, `.env.development` o `.env.production`.

### 1. Variables de Entorno en Desarrollo (`.env.development` / `.env`)
Para trabajar localmente con DynamoDB Local:

```env
NODE_ENV=development
PORT=3000

# DynamoDB Local Configuration
DYNAMO_ENDPOINT=http://localhost:8000
DYNAMO_TABLE_NAME=ControlDeObras
DYNAMO_REGION=us-east-1
DYNAMO_ACCESS_KEY=local
DYNAMO_SECRET_KEY=local

# Security & JWT
JWT_SECRET=desarrollo_secret_key_12345
```

### 2. Variables de Entorno en Producción (`.env.production`)
Para conectar directamente a la nube de AWS DynamoDB:

```env
NODE_ENV=production
PORT=3000

# AWS DynamoDB Cloud Configuration (Sin DYNAMO_ENDPOINT para apuntar a AWS)
DYNAMO_ENDPOINT=
DYNAMO_TABLE_NAME=ControlDeObras
DYNAMO_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Security & JWT
JWT_SECRET=produccion_super_secret_jwt_key
```

*Nota: En producción en entornos como AWS EC2, ECS o Lambda, las credenciales AWS pueden omitirse si se asignan mediante un IAM Role.*

---

## 💾 Respaldo y Seed de la Base de Datos (Backup & Restore)

El proyecto cuenta con un sistema integral de **Respaldo (Backup)** y **Población (Seed / Restore)** que es **100% fiel e íntegro a toda la base de datos actual**.

El archivo [seed_data.json](file:///Users/bladi/Downloads/controlObras/control-de-obras/backend/seed_data.json) contiene la **totalidad de los 171 registros** existentes en la base de datos, abarcando todas las tablas y entidades del sistema.

### 🔄 1. Restaurar / Poblar la Base de Datos (`npm run seed`)

Este comando lee el respaldo principal [seed_data.json](file:///Users/bladi/Downloads/controlObras/control-de-obras/backend/seed_data.json), verifica si la tabla `ControlDeObras` existe (si no existe, la crea automáticamente con sus llaves `pk`, `sk` e índice `GSI1`) y restaura todos los registros en el entorno configurado (Desarrollo o Producción):

```bash
npm run seed
```

### 📸 2. Generar un Respaldo Completo en Vivo (`npm run backup`)

Este comando escanea la base de datos completa (en Desarrollo o Producción) y exporta **todos los registros actuales**:
1. Actualiza el archivo principal [seed_data.json](file:///Users/bladi/Downloads/controlObras/control-de-obras/backend/seed_data.json).
2. Crea una copia de respaldo individual con marca de tiempo en la carpeta `backend/backups/backup_ControlDeObras_<TIMESTAMP>.json`.

```bash
npm run backup
```

---

### 📊 Distribución de Registros en el Respaldo (`seed_data.json`)

| Entidad | Descripción | Cantidad de Registros |
| --- | --- | --- |
| **Obra** | Obras registradas con sus estados, ATs, Oficios, fechas y coordenadas | 159 |
| **Area** | Áreas operativas / divisiones del sistema | 4 |
| **Personal** | Residentes, supervisores y personal de campo | 3 |
| **Zonas** | Zonas geográficas / administrativas | 1 |
| **Contrato** | Registro de contratos de contratistas | 1 |
| **Asignacion** | Asignaciones de contratos a obras por AT | 1 |
| **Estimacion** | Registro de estimaciones asociadas a obras y contratos | 1 |
| **Config** | Configuración general del sistema (SMTP, WhatsApp, etc.) | 1 |
| **TOTAL** | **Respaldo Íntegro de la Base de Datos** | **171** |

---

## 📐 Estructura del Esquema en DynamoDB (`ControlDeObras`)

La base de datos utiliza una **Single-Table Design** en DynamoDB. Las llaves principales son:
* **Partition Key (`pk`):** Identificador de ámbito/usuario (ej: base64 del email o prefijo global).
* **Sort Key (`sk`):** Tipo de entidad e ID (`obra#<SOLICITUD>`, `contrato#<NUMERO>`, `personal#<ID>`, etc.).
* **Global Secondary Index (`GSI1`):** `sk` como PK y `pk` como SK para búsquedas secundarias.

---

## 💻 Ejecución del Proyecto

```bash
# Modo Desarrollo con hot-reload
npm run start:dev

# Modo Producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3000/api`.

---

## ⚡ Despliegue en AWS Serverless (Lambda + API Gateway)

El proyecto incluye el handler [src/lambda.ts](file:///Users/bladi/Downloads/controlObras/control-de-obras/backend/src/lambda.ts) y la configuración de [serverless.yml](file:///Users/bladi/Downloads/controlObras/control-de-obras/backend/serverless.yml) mediante `@codegenie/serverless-express`.

### Desplegar a AWS Lambda con Serverless Framework:

```bash
# 1. Compilar el proyecto NestJS
npm run build

# 2. Desplegar a AWS (asegúrate de tener configuradas tus credenciales de AWS)
npx serverless deploy --stage prod
```

---

## 🗺️ Módulos y Endpoints Principales

| Módulo | Ruta Base | Descripción |
| --- | --- | --- |
| **Auth** | `/auth` | Registro (`POST /auth/register`) y Login (`POST /auth/login`). |
| **Obras** | `/obras` | Listado, creación, actualización, asignación, capitalización y bitácoras de obras. |
| **Contratos** | `/contratos` | Gestión de contratos, asignaciones de obras por AT y registro de estimaciones. |
| **Personal** | `/personal` | ABCC de personal de obra y supervisores. |
| **Zonas** | `/zonas` | ABCC de zonas administrativas y geográficas. |
| **Áreas** | `/areas` | Gestión de áreas operativas. |
| **Configuración**| `/config` | Pruebas y configuración SMTP/WhatsApp. |

---

## 🧪 Pruebas y Mantenimiento

```bash
# Ejecutar pruebas unitarias
npm run test

# Scripts útiles de mantenimiento en /backend:
npm run seed                     # Restaura/Pobla la BD desde el seed
npm run backup                   # Crea un respaldo completo en vivo de la BD
node update_obras_excel.js       # Actualiza ATs y Oficios desde Excel
node cleanup_retirement_dates.js  # Limpieza de datos temporales
node list_obras_markdown.js       # Exporta reporte general de obras
```
