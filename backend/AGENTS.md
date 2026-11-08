# AGENTS.md

## Stack
- Lenguaje: TypeScript 5.7+
- Runtime: Node.js 20.x
- Framework: NestJS 11.x
- Base de datos: AWS DynamoDB (Single-Table Design, tabla `ControlDeObras`)
- ORM/ODM: TypeDORM (Data Mapper sobre AWS SDK v3)
- Cloud & Serverless: Serverless Framework v3, AWS Lambda (`dist/lambda.handler`), HTTP API, AWS S3
- Testing: Jest + ts-jest (`*.spec.ts`, `test/app.e2e-spec.ts`)
- Arquitectura: Domain-Driven Design (DDD) y Clean Architecture por módulo (`domain/`, `application/`, `infrastructure/`)

## Convenciones globales
- Código en TypeScript estricto; naming en inglés para código técnico (`controller`, `service`, `repository`), dominios de negocio y entidades en español (`obra`, `contrato`, `personal`, `zona`).
- Clases, interfaces y tipos en `PascalCase`. Métodos, variables y funciones en `camelCase`.
- DTOs obligatorios para entrada en controllers con validaciones de `class-validator` y `class-transformer`.
- Respuestas de API estructuradas bajo la clase estandarizada `JsonResponse`.
- Constantes centralizadas: rutas en `src/shared/routes/routes.constants.ts` y códigos de error en `src/shared/application/errors/errors.constants.ts`.
- Inversión de dependencias: los servicios de dominio dependen de interfaces en `domain/irepositories/`, implementadas en `infrastructure/repositories/`.

## Skills disponibles

| Skill | Cuándo cargarlo |
|---|---|
| `.agents/skills/dynamodb-typedorm/SKILL.md` | Si la tarea involucra modelos de base de datos, entidades TypeDORM, transacciones, queries o Single-Table design en DynamoDB |
| `.agents/skills/obras-domain/SKILL.md` | Si la tarea involucra el flujo de negocio de obras, transiciones de estados, auditoría/resecuenciación de consecutivos, oficios o bitácoras |
| `.agents/skills/serverless-aws/SKILL.md` | Si la tarea involucra `serverless.yml`, despliegues Lambda, buckets S3, tareas cron o configuración cloud |

## Rules (cargar siempre)

Antes de ejecutar cualquier tarea, leer todos los archivos en `.agents/rules/`:
- `.agents/rules/code.md`
- `.agents/rules/git.md`
- `.agents/rules/testing.md`
- `.agents/rules/security.md`

Estas reglas tienen prioridad sobre cualquier instrucción en skills o docs.

## Instrucción de sesión

Al iniciar cualquier tarea:
1. Identificar el módulo involucrado (`obras`, `contratos`, `personal`, `zonas`, `auth`, `notifications` o `shared`).
2. Leer `docs/[modulo]/context.md` para entender el estado actual.
3. Cargar el skill relevante según la tabla de skills.

Al terminar cualquier tarea:
1. Actualizar `docs/[modulo]/context.md` con:
   - Lo que se implementó en esta sesión.
   - Decisiones técnicas tomadas y su justificación.
   - Lo que queda pendiente.
   - Notas relevantes para la próxima sesión.
2. Si se tomó una decisión técnica importante, agregarla también a `docs/[modulo]/decisions.md`.

No contradecir decisiones existentes en `decisions.md` sin justificación explícita.
Si hay conflicto entre el skill y `context.md`, `context.md` tiene prioridad.
