# Reglas de Testing

## 1. Backend (Jest + ts-jest)
- **Framework**: Jest configurado con `ts-jest` (`backend/tsconfig.json` y `package.json`).
- **Ubicación**: Tests unitarios junto a la implementación (`*.spec.ts`) o en `backend/test/` para pruebas e2e.
- **Aislamiento y Mocks**:
  - Sin acceso a base de datos real: nunca conectar a DynamoDB real ni local en tests unitarios.
  - Mockear el `EntityManager` de TypeDORM y los repositorios base.
  - Mockear servicios externos (`S3Service` para subida de planos, `MailService` para Nodemailer, `WhatsAppService` para mensajería).
- **Cobertura prioritaria**:
  - Lógica de cálculo y transiciones de estados de obras (`ObraService`).
  - Asignación de oficios consecutivos y normalización de fechas (`parseDateToTimestamp`).
  - Validaciones de entrada en DTOs con `class-validator`.

## 2. Frontend (Vitest + React Testing Library)
- **Framework**: Vitest y React Testing Library.
- **Ubicación**: Archivos de test junto al componente o servicio que prueban (`*.test.tsx` o `*.test.ts`).
- **Aislamiento y Mocks**:
  - Aislar peticiones HTTP mediante mocks de Axios en `src/services/`.
  - Probar funciones utilitarias y procesadores de datos (ej. parseo y cálculo de Excel con `xlsx`).
  - Probar componentes críticos verificando estados de carga (`loading`), error y éxito sobre el DOM accesible.

## 3. Regla de Oro
- Ningún cambio debe romper los tests existentes ni la compilación de TypeScript (`npm run build` en backend ni `npm run build` en frontend).

