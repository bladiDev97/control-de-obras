# Reglas de Código y Arquitectura

## 1. Backend (NestJS, DDD & Clean Architecture)
Cada módulo dentro de `backend/src/<modulo>/` debe organizarse estrictamente en tres capas:
- `domain/`:
  - `ientities/`: Interfaces TypeScript puras para entidades de dominio (e.g. `i-obra.interface.ts`). Sin dependencias de frameworks ni de librerías de persistencia.
  - `irepositories/`: Contratos de persistencia (e.g. `i-obra.repository.interface.ts`). El dominio define qué necesita, no la implementación.
  - `services/`: Servicios de dominio con la lógica y reglas de negocio, transiciones de estado y cálculos (e.g. `obra.service.ts`).
- `application/`:
  - `controller/`: Controladores NestJS que reciben peticiones HTTP y delegan a los servicios.
  - `dto/`: Data Transfer Objects con decoradores de validación de `class-validator` y transformación de `class-transformer`.
  - `decorator/`, `model/`: Decoradores de validación y modelos de API.
- `infrastructure/`:
  - `entities/`: Entidades decoradas con TypeDORM (`@Entity`, `@Attribute`), extendiendo `GenericEntity`.
  - `repositories/`: Implementaciones de persistencia que extienden `TypeDORMRepository` y usan `EntityManager`.

### Restricciones Backend
- La capa `domain` NUNCA debe importar librerías de infraestructura como `@typedorm/common`, `@typedorm/core` o clientes de DynamoDB.
- Los controladores de `application` no deben consumir repositorios directamente; deben hacerlo a través de servicios de dominio.
- Toda entidad de infraestructura debe implementar su respectiva interfaz en `domain/ientities/`.
- Rutas centralizadas en `backend/src/shared/routes/routes.constants.ts`. Errores centralizados en `backend/src/shared/application/errors/errors.constants.ts`.
- Toda respuesta de API debe usar la clase estándar `JsonResponse`.

## 2. Frontend (React 18, Vite & Material UI)
Cada módulo dentro de `frontend/src/modules/<modulo>/` debe organizarse preferentemente en:
- `components/`: Componentes de interfaz específicos del módulo.
- `hooks/`: Custom Hooks que encapsulan estado local, llamadas HTTP y flags (`loading`, `error`).
- `pages/`: Vistas completas asociadas al enrutador (`react-router-dom`).
- `services/`: Peticiones HTTP aisladas vía instancia centralizada de Axios (`src/services/api`).
- `types/`: Interfaces y enumeraciones TypeScript específicas del módulo.

### Restricciones Frontend
- No invocar `axios` directamente dentro de componentes React; encapsular en `services/` o hooks.
- Emplear componentes de layout de Material UI (`Box`, `Grid`, `Stack`, `Container`) en vez de divs nativos con estilos inline dispersos.
- Personalizar estilos usando el prop `sx` o temas globales en `frontend/src/styles/`.
- Componentes funcionales pequeños con responsabilidad única. Preferir exportaciones nombradas (`export const ComponentName = ...`).

## 3. Tipado y Calidad Global
- TypeScript en modo estricto en todo el proyecto; evitar el uso de `any` explícito. Usar `unknown` con estrechamiento de tipos cuando el dato sea incierto.
- Clases, interfaces y componentes en `PascalCase`. Métodos, variables y hooks en `camelCase`.
- Términos técnicos en inglés (`controller`, `service`, `repository`, `hook`), términos de dominio en español (`obra`, `contrato`, `personal`, `zona`).

