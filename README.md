# Control de Obras

Sistema empresarial Full Stack (NestJS + React + DynamoDB + TypeDORM)
generado con Clean Architecture / DDD.

## Estructura

- `backend/` — API NestJS (Clean Architecture: application/domain/infrastructure por modulo)
- `frontend/` — SPA React + MUI
- `install.sh` — instala dependencias de ambos proyectos

## Modulos implementados como base

1. **Obras** — listado, filtros, paginacion, terminar obra (completo)
2. **Bitacoras** — formulario + generacion automatica de 6 formatos con plantillas dinamicas
3. **Capitalizacion** — listado de obras pendientes de capitalizar
4. **Excel Import** — carga e importacion masiva de solicitudes
5. **Asignacion** — asignacion de obra + carga de plano PDF (vive en ObrasController)

Los modulos `bitacoras`, `capitalizacion`, `excel-import` y `asignacion` ya
incluyen la carpeta completa (application/domain/infrastructure) lista para
que se repliquen ahi mismo entidades, repositorios y DTOs adicionales
siguiendo exactamente el mismo patron usado en `obras`.

## Quick start

```bash
chmod +x install.sh
./install.sh
```

## Repositorio generico

Todos los repositorios concretos extienden `TypeDORMRepository<T, K>`
ubicado en `backend/src/shared/infrastructure/repository/typedorm-generic.repository.ts`.
