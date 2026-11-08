# AGENTS.md

## Stack
- Lenguaje: TypeScript 5
- Framework & Build: React 18 + Vite 5
- UI Toolkit: Material UI (MUI v5) + Emotion + MUI Date Pickers
- Enrutamiento: React Router DOM v6
- Formularios: React Hook Form
- Mapas: Leaflet / react-leaflet
- Archivos y Datos: xlsx (Excel/XLSB)
- Cliente HTTP: Axios (consumiendo backend REST vía `VITE_API_URL`)
- Testing: Vitest + React Testing Library

## Convenciones Globales
- Arquitectura basada en módulos de dominio dentro de `src/modules/<modulo>/` conteniendo `components/`, `hooks/`, `pages/`, `services/` y `types/`.
- Componentes UI compartidos y transversales en `src/components/`, layouts en `src/layouts/`.
- Nombres de componentes y páginas en PascalCase (e.g. `ObrasList.tsx`).
- Nombres de utilidades y hooks en camelCase con prefijo `use` para hooks (e.g. `useObras.ts`).
- Tipado estricto con TypeScript: evitar el uso de `any` explícito.
- Commits descriptivos en español sobre la rama de trabajo.

## Skills Disponibles

| Skill | Cuándo cargarlo |
|---|---|
| `.agents/skills/frontend-architecture/SKILL.md` | Al crear o refactorizar módulos, componentes, layouts, hooks o servicios de API |
| `.agents/skills/excel-processing/SKILL.md` | Al implementar o modificar lógica de parseo, validación o exportación con `xlsx` |
| `.agents/skills/map-geo/SKILL.md` | Al trabajar con mapas interactivos, capas georreferenciadas o marcadores Leaflet |

## Rules (Cargar Siempre)

Antes de ejecutar cualquier tarea, leer todos los archivos en `.agents/rules/`:
- `.agents/rules/code.md`: Estándares de TypeScript, React y MUI.
- `.agents/rules/git.md`: Formato y política de commits en español.
- `.agents/rules/testing.md`: Guías para Vitest y React Testing Library.
- `.agents/rules/security.md`: Variables de entorno cliente, sanitización y manejo de archivos.

Estas reglas tienen prioridad sobre cualquier instrucción en skills o docs.

## Instrucción de Sesión

Al iniciar cualquier tarea:
1. Identificar el módulo involucrado dentro de `src/modules/`.
2. Leer `docs/[modulo]/context.md` y `docs/[modulo]/behavior.md` para entender el estado actual y reglas de negocio.
3. Cargar el skill relevante según la tabla de skills.

Al terminar cualquier tarea:
1. Actualizar `docs/[modulo]/context.md` con:
   - Lo implementado o modificado en la sesión.
   - Decisiones tomadas y pendientes concretos.
2. Si se tomó una decisión arquitectónica o de negocio importante, registrarla en `docs/[modulo]/decisions.md`.

Si hay conflicto entre una skill y el `context.md`, el `context.md` tiene prioridad.

