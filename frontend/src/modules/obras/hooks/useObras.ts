import { useEffect, useState, useCallback } from 'react';
import { obrasService } from '../services/obras.service';
import { Obra } from '../types/obra.types';

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchObras = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obrasService.getAll();
      setObras(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  return { obras, loading, refetch: fetchObras };
}
