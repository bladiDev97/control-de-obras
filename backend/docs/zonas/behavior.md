# Módulo: Zonas

## Propósito
Gestiona la división territorial, geográfica y administrativa de las obras. Permite categorizar y segmentar las obras públicas, asignaciones y personal según la zona operativa correspondiente.

## Entradas
- Datos de zona: Nombre de la zona, código identificador, descripción, municipios o poblaciones cubiertas.

## Salidas
- Zonas persistidas en DynamoDB (`ZonaEntity`).
- Catálogo de zonas para asignación en obras y personal.

## Reglas de negocio
1. El código identificador de zona debe ser único dentro del sistema.
2. Una obra pertenece a una sola zona geográfica principal.
3. Las bajas de zonas deben validar que no existan obras activas (`PENDIENTE` o `ASIGNADA`) adscritas a dicha zona.

