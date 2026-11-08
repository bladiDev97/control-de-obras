# Skill: Frontend Architecture

## Cuándo se usa
Se utiliza al diseñar, crear o refactorizar estructuras de código dentro del frontend, especialmente al añadir nuevos módulos, componentes compartidos, layouts, hooks personalizados o integración de servicios API.

## Reglas principales
1. **Separación por Capas del Módulo**: Mantener la vista (`pages/`, `components/`) desacoplada de la lógica de negocio y consumo HTTP (`hooks/`, `services/`).
2. **Servicios Centralizados**: Todas las peticiones HTTP deben definirse dentro de `services/` utilizando la instancia configurada de Axios y retornar tipos estrictos de `types/`.
3. **Custom Hooks Reutilizables**: Encapsular estados de carga (`loading`), error (`error`) y mutación de datos en hooks para que los componentes permanezcan declarativos.
4. **MUI Best Practices**: Emplear componentes de layout de Material UI (`Box`, `Grid`, `Stack`, `Container`) en lugar de divs nativos con CSS inline.

## Patrones y Ejemplos

### Estructura típica de servicio
```typescript
import axios from '../../services/api';
import { Obra } from '../types/obra.types';

export const getObras = async (): Promise<Obra[]> => {
  const response = await axios.get<Obra[]>('/obras');
  return response.data;
};
```

### Estructura típica de hook
```typescript
import { useState, useEffect } from 'react';
import { getObras } from '../services/obrasService';
import { Obra } from '../types/obra.types';

export const useObras = () => {
  const [data, setData] = useState<Obra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getObras()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};
```

## Lo que NO hacer
- No llamar a `axios.get` o `axios.post` directamente dentro de un componente React sin pasar por `services/` o un hook.
- No duplicar interfaces o tipos en múltiples archivos; centralizarlos en `types/`.
- No mezclar lógica de estilos globales fuera del sistema de temas de MUI.

