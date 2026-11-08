---
name: map-geo
description: Manejo de mapas interactivos con Leaflet, gestión de coordenadas geográficas, capas, marcadores y popups informativos de obras.
---

# Skill: Map & Geolocation

## Cuándo se usa
Se utiliza en tareas que involucren el mapa interactivo de obras (`frontend/src/modules/mapa/`), renderizado de marcadores con Leaflet, gestión de coordenadas X / Y (latitud/longitud o UTM) y popups informativos de estado de obra.

## Reglas principales
1. **Validación de Coordenadas**: Verificar que latitud y longitud sean valores numéricos finitos y válidos antes de pasarlos a Leaflet para evitar errores de renderizado.
2. **Iconos y Marcadores**: Asegurar que los assets de marcadores de Leaflet (`marker-icon.png`, `marker-shadow.png`) estén correctamente referenciados para evitar marcadores rotos en producción.
3. **Optimización de Render**: Cuando existan cientos o miles de obras en el mapa, utilizar clustering o filtrado por viewport/zoom para preservar fluidez en el cliente.
4. **Limpieza de Recursos**: Desmontar o invalidar el tamaño del mapa (`map.invalidateSize()`) al cambiar de pestaña o redimensionar contenedor.

## Patrones y Ejemplos

### Verificación de coordenadas
```typescript
export const isValidCoordinate = (lat?: number, lng?: number): boolean => {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90 &&
         typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
};
```

## Lo que NO hacer
- No inicializar instancias múltiples de Leaflet sobre el mismo contenedor DOM sin destruirlas previamente.
- No omitir el CSS base de Leaflet (`import 'leaflet/dist/leaflet.css'`).

