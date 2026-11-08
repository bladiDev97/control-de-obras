# Reglas de Testing

## Framework
- Framework establecido: Vitest + React Testing Library.
- Los archivos de test deben ubicarse junto al componente o servicio que prueban, con extensión `.test.tsx` o `.test.ts`.

## Cobertura Prioritaria
- Probar funciones utilitarias y procesadores de datos (ej. parseo y cálculo de Excel).
- Probar hooks personalizados aislando las respuestas de API mediante mocks de Axios.
- Probar componentes críticos de UI verificando renderizado de estados de carga, error y éxito, en lugar de probar detalles de implementación interna.

## Regla de Oro
- Ningún cambio debe romper los tests existentes ni la compilación de TypeScript (`npm run build`).

