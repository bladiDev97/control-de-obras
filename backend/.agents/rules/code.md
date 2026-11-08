# Reglas de Código y Arquitectura

## 1. Organización en Capas (DDD & Clean Architecture)
Cada módulo dentro de `src/<modulo>/` debe organizarse estrictamente en tres capas:
- `domain/`:
  - `ientities/`: Interfaces puras de las entidades y modelos de dominio (e.g. `i-obra.interface.ts`). Sin dependencias de frameworks ni de TypeDORM.
  - `irepositories/`: Contratos de persistencia (e.g. `i-obra.repository.interface.ts`). El dominio define qué necesita, no cómo se almacena.
  - `services/`: Servicios de dominio que contienen las reglas de negocio, cálculos de estado y orquestación de operaciones de dominio (e.g. `obra.service.ts`).
- `application/`:
  - `controller/`: Controladores NestJS que reciben peticiones HTTP y delegan a los servicios.
  - `dto/`: Data Transfer Objects tipados con decoradores de validación de `class-validator` y `class-transformer`.
  - `decorator/`, `model/`: Decoradores personalizados y modelos de API.
- `infrastructure/`:
  - `entities/`: Clases de entidad decoradas con TypeDORM (`@Entity`, `@Attribute`), extendiendo `GenericEntity`.
  - `repositories/`: Implementaciones concretas de acceso a datos que extienden `TypeDORMRepository` y usan `EntityManager`.

## 2. Inversión de Dependencias y Desacoplamiento
- La capa de `domain` NUNCA debe importar librerías de infraestructura como `@typedorm/common`, `@typedorm/core` o clientes directos de base de datos.
- Los controladores de `application` no deben interactuar directamente con repositorios de infraestructura; deben comunicarse a través de los servicios de dominio.
- Toda entidad de infraestructura debe implementar la interfaz correspondiente de `domain/ientities/`.

## 3. Manejo de Rutas y Errores
- No definir strings de rutas ni etiquetas Swagger 'hardcodeadas' en los controladores. Usar el catálogo centralizado en `src/shared/routes/routes.constants.ts`.
- Los errores de negocio y validación deben usar la estructura y catálogo en `src/shared/application/errors/errors.constants.ts` o lanzar excepciones HTTP semánticas de NestJS (`BadRequestException`, `NotFoundException`, `UnauthorizedException`).
- Toda respuesta de API en controladores debe retornar el estándar `JsonResponse` (`src/shared/application/model/json-response.class.ts`).

## 4. Estilo y Tipado en TypeScript
- Modo estricto activado: prohibido el uso injustificado de `any`. Si un tipo es desconocido o genérico, utilizar `unknown` o genéricos parametrizados `<T>`.
- Nombres de clases e interfaces en `PascalCase`.
- Nombres de métodos, propiedades y variables en `camelCase`.
- Constantes globales o de configuración en `UPPER_SNAKE_CASE`.
- Archivos deben nombrarse con sufijos semánticos en minúsculas separados por puntos: `<nombre>.<tipo>.ts` (ej: `obra.service.ts`, `obra.controller.ts`, `obra.create.dto.ts`).

## 5. Persistencia con DynamoDB / TypeDORM
- Toda entidad persistida se almacena en la tabla única (`ControlDeObras`) respetando las llaves `pk` y `sk`, y el índice secundario global `GSI1`.
- Siempre verificar la existencia de índices antes de diseñar queries para evitar `Scan` sobre DynamoDB en producción.
