# Reglas de Git y Flujo de Trabajo (GitFlow)

## 1. Modelo de Ramas (GitFlow)
El proyecto utiliza estrictamente el flujo **GitFlow**:

- `main`:
  - Contiene exclusivamente código en estado de producción estable y desplegable a AWS.
  - Cada merge a `main` debe corresponder a un tag de versión (`vX.Y.Z`).
  - Prohibido hacer commits directos (`push --force` completamente bloqueado).
- `develop`:
  - Rama de integración principal para nuevas características y desarrollos en curso.
  - Base para la creación de ramas `feature/*` y destino de sus fusiones.
- `feature/<nombre-tarea>`:
  - Ramas creadas a partir de `develop` para desarrollar nuevas funcionalidades o requerimientos.
  - Nomenclatura en kebab-case: `feature/oficios-consecutivos`, `feature/s3-plano-upload`.
  - Se integran nuevamente a `develop` mediante Pull Request (PR).
- `release/<version>`:
  - Ramas preparatorias para un nuevo release de producción (ej: `release/1.1.0`), creadas desde `develop`.
  - Solo reciben ajustes menores de documentación o hotfixes de release.
  - Se fusionan a `main` (con tag) y de vuelta a `develop`.
- `hotfix/<descripcion>`:
  - Ramas urgentes creadas directamente a partir de `main` para resolver bugs críticos en producción.
  - Al resolverse, se fusionan tanto a `main` (con nuevo tag patch) como a `develop`.
- `bugfix/<descripcion>`:
  - Ramas derivadas de `develop` para corregir bugs encontrados durante el ciclo regular de desarrollo.

## 2. Formato de Mensajes de Commit
Se deben utilizar mensajes atómicos, descriptivos y categorizados con la convención estándar:
- `feat: <descripcion>` para nuevas funcionalidades.
- `fix: <descripcion>` para corrección de bugs.
- `refactor: <descripcion>` para reestructuración de código sin alterar comportamiento externo.
- `docs: <descripcion>` para cambios en documentación o archivos en `docs/` y `AGENTS.md`.
- `test: <descripcion>` para incorporación o ajuste de tests.
- `chore: <descripcion>` para cambios de configuración, dependencias o scripts auxiliares.

Ejemplo:
```bash
feat(obras): agregar validacion de consecutivos duplicados en oficios
fix(contratos): corregir calculo de deducciones en estimacion
```

## 3. Políticas de Pull Request (PR)
- Todo PR hacia `develop` o `main` debe incluir una descripción clara del cambio y los módulos afectados.
- Debe pasar las verificaciones de linter (`npm run lint`) y pruebas automatizadas (`npm test`) antes de la aprobación.
- Se debe evitar commits masivos con cambios no relacionados entre sí.
