import { useState } from 'react';
import { Obra } from '../../obras/types/obra.types';
import { etiquetasService } from '../services/etiquetas.service';

export const useEtiquetas = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handlePrint = (obras: Obra[]) => {
    const selectedObras = obras.filter(o => selectedIds.includes(o.id));
    etiquetasService.generarYImprimirEtiquetas(selectedObras);
  };

  return {
    selectedIds,
    handleSelect,
    handlePrint
  };
};
