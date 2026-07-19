import React, { useMemo } from 'react';
import { Box, Typography, Button, TextField, Grid, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useAvisoSuspension } from '../hooks/useAvisoSuspension';
import { avisoService } from '../services/aviso.service';

export const AvisoSuspensionTab: React.FC = () => {
  const {
    fecha, setFecha,
    ubicacion, setUbicacion,
    horario, setHorario,
    telefono, setTelefono
  } = useAvisoSuspension();

  const handlePrint = () => {
    avisoService.generarAvisoSuspension(fecha, ubicacion, horario, telefono);
  };

  const previewHtml = useMemo(() => {
    return avisoService.getAvisoHtml(fecha, ubicacion, horario, telefono, false);
  }, [fecha, ubicacion, horario, telefono]);

  return (
    <Grid container spacing={4}>
      {/* Formulario (Lado Izquierdo) */}
      <Grid item xs={12} md={5}>
        <Box sx={{ 
          backgroundColor: 'white', 
          p: 4, 
          borderRadius: 2, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          height: { xs: 'auto', md: 'calc(100vh - 130px)' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                helperText="Ej: 21/JULIO/2026"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                helperText="Ej: 4437969662"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ubicación / Calles"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                helperText="Ej: Carretera Morelia a Pátzcuaro"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Horario de Suspensión"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                helperText="Ej: 10:00 a 17:00 horas."
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              size="large"
              sx={{
                backgroundColor: '#00a650',
                padding: '12px 20px',
                fontSize: '16px',
                '&:hover': { backgroundColor: '#008a42' },
                boxShadow: '0 4px 6px rgba(0, 166, 80, 0.2)',
              }}
            >
              Imprimir Volante CFE
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Previsualización (Lado Derecho) */}
      <Grid item xs={12} md={7}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#e0e0e0',
          p: 2,
          borderRadius: 2,
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
          // En escritorio, limitamos la altura al tamaño de la ventana para no hacer scroll
          height: { xs: 'auto', md: 'calc(100vh - 130px)' },
          minHeight: { xs: '60vh', md: 'auto' }
        }}>
          <Paper
            elevation={4}
            sx={{
              width: { xs: '100%', md: 'auto' },
              height: { xs: 'auto', md: '100%' },
              maxWidth: '100%',
              maxHeight: '100%',
              aspectRatio: '21.59 / 27.94', // Proporción carta
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <iframe
              srcDoc={previewHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Preview Flyer CFE"
            />
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
};
