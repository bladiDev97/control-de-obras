# Reglas de Código

## TypeScript & React
- Usar TypeScript estricto. Definir interfaces o types para todos los modelos de datos y props de componentes en `<modulo>/types/`.
- Evitar el uso de `any`. Si el tipo aún es incierto, usar `unknown` y estrechar tipos.
- Mantener los componentes funcionales pequeños, con responsabilidad única y usando Custom Hooks para desacoplar la lógica de estado/API de la vista.
- Preferir exportaciones nombradas (`export const ComponentName = ...`) para facilitar autocompletado y refactorización.

## UI & Estilos
- Utilizar componentes y sistema de diseño de Material UI (MUI v5).
- Personalizar estilos usando el hook `sx` de MUI o temas centralizados en `src/styles/`.
- Mantener consistencia visual en tablas, modales y formularios en todos los módulos.

## Estructura Modular
- Cada módulo en `src/modules/<modulo>/` debe organizarse preferentemente en:
  - `components/`: Componentes específicos del módulo.
  - `hooks/`: Lógica de llamada a APIs y estado local.
  - `pages/`: Vistas completas asociadas a rutas.
  - `services/`: Peticiones HTTP aisladas vía Axios.
  - `types/`: Interfaces y enumeraciones del módulo.

