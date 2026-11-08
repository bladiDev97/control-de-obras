# Módulo: Mapa

## Propósito
Visualización geoespacial interactiva de obras y circuitos eléctricos para análisis territorial y de cobertura operativa. Permite identificar la distribución geográfica de las obras por estado, zona y contratista sobre un mapa base.

## Entradas
- Coordenadas geográficas (latitud y longitud, o valores X/Y UTM transformados) de las obras.
- Filtros por estado de obra, circuito o zona operativa.

## Salidas
- Vista de mapa Leaflet con marcadores interactivos coloreados por estado de obra.
- Tooltips y popups con información resumida: nombre, contratista, estado, zona.

## Reglas de negocio
1. Solo se renderiza un marcador si la obra dispone de coordenadas numéricas válidas (latitud y longitud finitas).
2. Las obras canceladas pueden aparecer en el mapa con un estilo visual diferenciado (marcador atenuado o de color distinto).
3. Al renderizar muchas obras simultáneamente, aplicar clustering para preservar el rendimiento del cliente.

