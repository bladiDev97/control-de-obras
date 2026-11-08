# Reglas de Testing

## 1. Framework y Herramientas
- **Runner:** Jest con preset `ts-jest` configurado en `package.json`.
- **Estructura de Tests Unitarios:** Sufijo `*.spec.ts` colocalizados junto al archivo a probar o dentro de la capa correspondiente en `src/`.
- **Tests E2E:** Ubicados en el directorio raíz `test/` (e.g. `test/app.e2e-spec.ts`).

## 2. Aislamiento y Mocking
- **Sin acceso a base de datos real en tests unitarios:** Nunca conectar a DynamoDB real ni local en pruebas unitarias.
- **Mock de TypeDORM:**
  - Mockear el `EntityManager` y las instancias de repositorios que extienden `TypeDORMRepository`.
  - Simular respuestas de búsqueda (`itemsBySearchDTO`), creación (`createItem`), actualización y eliminación.
- **Mock de Servicios de Infraestructura Externa:**
  - `S3Service`: Mockear operaciones de `putObject`, `getObject` y generación de URLs firmadas.
  - `MailService`: Mockear envíos SMTP de Nodemailer.
  - `WhatsAppService`: Mockear llamadas HTTP / Axios a APIs de mensajería externa.

## 3. Cobertura Prioritaria
- **Servicios de Dominio (`src/<modulo>/domain/services/`):**
  - Es mandatorio probar la lógica de cálculo y cambio de estados (por ejemplo, transiciones de estados en `ObraService`: `PENDIENTE` → `ASIGNADA` → `TERMINADA` → `CAPITALIZADA`).
  - Lógica de asignación de números de oficio y control de consecutivos.
  - Parsing y validación de formatos de fechas (`parseDateToTimestamp`).
- **DTOs y Validaciones de Entrada:**
  - Verificar que campos obligatorios y formatos numéricos o de fecha sean rechazados si no cumplen los constraints de `class-validator`.

## 4. Ejecución de Tests
- Pruebas unitarias: `npm run test`
- Modo observador (TDD): `npm run test:watch`
- Cobertura: `npm run test:cov`
- Pruebas End-to-End: `npm run test:e2e`

Ningún commit o PR debe romper la suite de tests existente.
