# Reglas de Git y Flujo de Trabajo (GitFlow)

## 1. Modelo de Ramas (GitFlow)
El repositorio utiliza el flujo **GitFlow**:

- `main`:
  - Código exclusivamente en estado de producción estable y desplegable.
  - Cada merge a `main` corresponde a un tag de versión (`vX.Y.Z`).
  - Prohibido hacer commits directos o `push --force`.
- `develop`:
  - Rama de integración principal para desarrollo activo.
  - Base para crear ramas `feature/*` y destino de sus fusiones.
- `feature/<nombre-tarea>`:
  - Ramas creadas a partir de `develop` para funcionalidades o requerimientos nuevos.
  - Nomenclatura en kebab-case: `feature/oficios-consecutivos`, `feature/s3-plano-upload`.
  - Se integran a `develop` mediante Pull Request (PR).
- `release/<version>`:
  - Ramas preparatorias para un nuevo release de producción creadas desde `develop`.
  - Solo reciben ajustes menores de documentación o hotfixes de release.
- `hotfix/<descripcion>`:
  - Ramas urgentes creadas directamente desde `main` para resolver bugs críticos en producción.
  - Se fusionan tanto a `main` (con nuevo tag patch) como a `develop`.
- `bugfix/<descripcion>`:
  - Ramas derivadas de `develop` para corregir bugs detectados durante el ciclo de desarrollo.

## 2. Formato de Mensajes de Commit
- Escribir mensajes en español, claros y descriptivos en tiempo presente/imperativo o siguiendo Conventional Commits:
  - `feat(obras): agregar filtro por estado en módulo de obras`
  - `fix(excel): corregir validación de columnas en importador de Excel`
  - `refactor(mapa): optimizar cálculo de coordenadas y zoom en Leaflet`
  - `docs(contratos): actualizar especificación de estimaciones`
- Commits atómicos: cada commit debe corresponder a una unidad lógica de cambio coherente.
- Verificar compilación exitosa (`npm run build` en backend y/o frontend) antes de integrar cambios a ramas compartidas.

