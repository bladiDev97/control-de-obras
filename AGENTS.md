# AGENTS.md

## Stack
- **Backend**: Node.js 20.x, TypeScript 5.7+, NestJS 11.x, AWS DynamoDB (Single-Table Design, tabla `ControlDeObras`) con TypeDORM, Serverless Framework v3 (AWS Lambda `dist/lambda.handler`, S3, HTTP API), Jest + ts-jest. Arquitectura: Domain-Driven Design (DDD) y Clean Architecture (`domain/`, `application/`, `infrastructure/`).
- **Frontend**: React 18, Vite 5, TypeScript 5.3+, Material UI (MUI v5) + Emotion, React Router DOM v6, React Hook Form, Leaflet / react-leaflet, SheetJS (`xlsx`), Vitest + React Testing Library. Arquitectura: Modular por dominio en `src/modules/<modulo>/`.
- **Git**: GitFlow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`, `bugfix/*`), commits descriptivos en español.

## Convenciones globales
- **Tipado estricto**: TypeScript estricto en ambos lados; evitar `any` explícito.
- **Nomenclatura**:
  - Clases, interfaces, componentes React y páginas en `PascalCase`.
  - Métodos, funciones, variables y custom hooks en `camelCase` (hooks con prefijo `use`).
  - Nombres técnicos en inglés (`controller`, `service`, `repository`), conceptos de negocio y entidades en español (`obra`, `contrato`, `personal`, `zona`).
- **Backend**:
  - DTOs obligatorios para entrada en controllers con `class-validator` y `class-transformer`.
  - Respuestas estructuradas bajo la clase estandarizada `JsonResponse`.
  - Inversión de dependencias: servicios de dominio dependen de interfaces en `domain/irepositories/`, implementadas en `infrastructure/repositories/`.
  - Catálogos centralizados: rutas en `src/shared/routes/routes.constants.ts` y errores en `src/shared/application/errors/errors.constants.ts`.
- **Frontend**:
  - Módulos en `src/modules/<modulo>/` conteniendo `components/`, `hooks/`, `pages/`, `services/` y `types/`.
  - Componentes transversales en `src/components/`, layouts en `src/layouts/`.
  - Peticiones HTTP aisladas en `services/` con Axios y tipado estricto.

## Skills disponibles

| Skill | Cuándo cargarlo |
|---|---|
| `.agents/skills/obras-domain/SKILL.md` | Si la tarea involucra el ciclo de vida de obras, cálculo de estados, consecutivos, oficios, planos técnicos o bitácoras |
| `.agents/skills/dynamodb-typedorm/SKILL.md` | Si la tarea involucra entidades TypeDORM, transacciones, queries, GSI o Single-Table design en DynamoDB |
| `.agents/skills/serverless-aws/SKILL.md` | Si la tarea involucra `serverless.yml`, funciones Lambda, buckets S3, eventos cron o infraestructura cloud |
| `.agents/skills/frontend-architecture/SKILL.md` | Si la tarea involucra crear o refactorizar módulos React, componentes MUI, layouts, hooks o servicios API |
| `.agents/skills/excel-processing/SKILL.md` | Si la tarea involucra leer, validar, transformar o exportar archivos Excel (`.xlsx`, `.xlsb`, `.csv`) con SheetJS |
| `.agents/skills/map-geo/SKILL.md` | Si la tarea involucra mapas interactivos con Leaflet, coordenadas geográficas o marcadores de obras |

## Rules (cargar siempre)

Antes de ejecutar cualquier tarea, leer todos los archivos en `.agents/rules/`:
- `.agents/rules/code.md`
- `.agents/rules/git.md`
- `.agents/rules/testing.md`
- `.agents/rules/security.md`

Estas reglas tienen prioridad sobre cualquier instrucción en skills o docs.

## Instrucción de sesión

Al iniciar cualquier tarea:
1. Identificar el módulo involucrado (`obras`, `contratos`, `personal`, `zonas`, `auth`, `notifications`, `mapa`, `capitalizacion`, `bitacoras`, `reportes`, `excelImport`, `configuracion`, `asignacion`).
2. Leer `docs/[modulo]/context.md` y `docs/[modulo]/behavior.md` para entender el estado actual y reglas de negocio.
3. Cargar el skill relevante según la tabla de skills.

Al terminar cualquier tarea:
1. Actualizar `docs/[modulo]/context.md` con:
   - Lo implementado o modificado en la sesión.
   - Decisiones técnicas tomadas y su justificación.
   - Lo que queda pendiente.
   - Notas relevantes para la próxima sesión.
2. Si se tomó una decisión arquitectónica o de negocio importante, agregarla también a `docs/[modulo]/decisions.md`.

No contradecir decisiones existentes en `decisions.md` sin justificación explícita.
Si hay conflicto entre el skill y `context.md`, `context.md` tiene prioridad.

