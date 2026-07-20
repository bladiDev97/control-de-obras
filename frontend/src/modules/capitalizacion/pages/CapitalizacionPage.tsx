import React, { useEffect, useState, useCallback } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { obrasService } from '../../obras/services/obras.service';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import ReusableModal from '../../../components/Modal/ReusableModal';
import { Obra } from '../../obras/types/obra.types';

export default function CapitalizacionPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Obra | null>(null);
  const [fechaCapitalizacion, setFechaCapitalizacion] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  const fetchObras = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obrasService.getCapitalizar();
      setObras(data);
    } catch (err) {
      console.error('Error cargando obras para capitalizar:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  const handleConfirmCapitalizar = async () => {
    if (!selected) return;
    try {
      await obrasService.update({
        solicitudPo: selected.id,
        fechaCapitalizacion,
      });
      setSelected(null);
      fetchObras();
    } catch (err) {
      console.error('Error al capitalizar obra:', err);
    }
  };

  const columns: Column<Obra>[] = [
    {
      key: 'solicitudPo',
      label: 'Solicitud/PO',
      render: (row) => (
        <span
          onClick={() => {
            setSelected(row);
            setFechaCapitalizacion(new Date().toISOString().slice(0, 10));
          }}
          style={{ cursor: 'pointer', color: '#008E60', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          {row.solicitudPo}
        </span>
      ),
    },
    { key: 'at', label: 'AT' },
    { key: 'obra', label: 'Obra' },
    { key: 'anio', label: 'Año' },
    { key: 'activo', label: 'Activo' },
    { key: 'orden', label: 'Orden' },
    { key: 'fechaAsignacion', label: 'Fecha de Inicio' },
    { key: 'fechaFinConstruccion', label: 'Fecha de Término' },
    {
      key: 'diasSinCapitalizar',
      label: 'Días sin Capitalizar',
      render: (row) => {
        const dias = row.diasSinCapitalizar ?? 0;
        let color = '#2e7d32'; // Verde (10 o menor)
        if (dias >= 17) color = '#c62828'; // Rojo (a partir de 17 días)
        else if (dias >= 11) color = '#ef6c00'; // Amarillo/Naranja (de 11 a 16 días)

        return (
          <span
            onClick={() => {
              setSelected(row);
              setFechaCapitalizacion(new Date().toISOString().slice(0, 10));
            }}
            style={{ color, fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {dias} {dias === 1 ? 'día' : 'días'}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="page-title">Obras Pendientes de Capitalizar</h1>
      {loading ? (
        <Typography>Cargando obras...</Typography>
      ) : (
        <ReusableTable columns={columns} rows={obras} defaultOrderBy="diasSinCapitalizar" defaultOrderDir="desc" />
      )}

      <ReusableModal
        open={!!selected}
        title={`Capitalizar Obra / PO: ${selected?.solicitudPo}`}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirmCapitalizar}
      >
        <div style={{ marginTop: '8px' }}>
          <TextField
            label="Fecha de Capitalización"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={fechaCapitalizacion}
            onChange={(e) => setFechaCapitalizacion(e.target.value)}
            fullWidth
          />
        </div>
      </ReusableModal>
    </div>
  );
}
