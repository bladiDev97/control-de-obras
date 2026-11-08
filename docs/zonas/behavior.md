# Módulo: Zonas

## Propósito
Gestiona la división territorial y administrativa de las obras. Permite categorizar y segmentar obras públicas, contratos y personal según la zona operativa geográfica correspondiente (subestaciones, sectores de distribución eléctrica o municipios cubiertos).

## Entradas
- Datos de zona: Nombre, código identificador único, descripción, municipios o sectores cubiertos.

## Salidas
- Zonas persistidas en DynamoDB con entidad `ZonaEntity` (`pk: ZONA#<id>`, `sk: metadata`).
- Catálogo de zonas disponible como referencia para asignación de obras, personal y filtros en frontend.

## Reglas de negocio
1. El código identificador de zona debe ser único dentro del sistema.
2. Una obra pertenece a una sola zona geográfica principal.
3. No se puede dar de baja una zona si tiene obras activas (`PENDIENTE` o `ASIGNADA`) adscritas a ella.

