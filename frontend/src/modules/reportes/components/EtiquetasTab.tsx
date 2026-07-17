import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import { Obra } from '../../obras/types/obra.types';

interface EtiquetasTabProps {
  obras: Obra[];
  etiquetasColumns: Column<Obra>[];
  onPrint: () => void;
  selectedCount: number;
}

export const EtiquetasTab: React.FC<EtiquetasTabProps> = ({ 
  obras, 
  etiquetasColumns, 
  onPrint, 
  selectedCount 
}) => {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
          Impresión de Etiquetas de Expediente
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona las obras y presiona "Generar Etiquetas" para imprimir el formato de muesca de folder.
        </Typography>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={onPrint}
          disabled={selectedCount === 0}
          sx={{
            backgroundColor: '#1b5e20',
            '&:hover': { backgroundColor: '#124116' },
            boxShadow: '0 4px 6px rgba(27, 94, 32, 0.2)',
          }}
        >
          Generar Etiquetas ({selectedCount})
        </Button>
      </Box>

      <Box sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <ReusableTable columns={etiquetasColumns} rows={obras} />
      </Box>
    </Box>
  );
};
