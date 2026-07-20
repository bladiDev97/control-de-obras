import React, { useMemo, useEffect } from 'react';
import { Box, Button, TextField, Grid, Typography, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useAvisoMt } from '../hooks/useAvisoMt';
import { avisoMtService } from '../services/aviso-mt.service';
import { personalService } from '../../personal/services/personal.service';
import { zonasService } from '../../zonas/services/zonas.service';

const formatFechaElaboracion = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
};

const formatFechaSuspension = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
};

export const AvisoSuspensionMtTab: React.FC = () => {
  const {
    fechaElaboracion, setFechaElaboracion,
    municipioEstado, setMunicipioEstado,
    fechaSuspension, setFechaSuspension,
    horario, setHorario,
    ubicacion, setUbicacion,
    telefono, setTelefono,
    supervisorNombre, setSupervisorNombre,
    supervisorZona, setSupervisorZona
  } = useAvisoMt();

  const [footerText, setFooterText] = React.useState('');

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const personnel = await personalService.getAll();
        const supervisor = personnel.find(p => p.cargo.toLowerCase().includes('supervisor'));
        if (supervisor) {
          setSupervisorNombre(`${supervisor.nombres} ${supervisor.apellidoPaterno} ${supervisor.apellidoMaterno || ''}`.trim());
        }

        const zonasList = await zonasService.getAll();
        if (zonasList && zonasList.length > 0) {
          const z = zonasList[0];
          setMunicipioEstado(`${z.municipio}, ${z.estado}.`);
          setSupervisorZona(z.zona.toLowerCase().includes('zona') ? z.zona : `Zona ${z.zona}`);
          setFooterText(`${z.domicilio}, Colonia ${z.colonia}, ${z.municipio}, ${z.estado}, México<br />C.P. ${z.codigoPostal} Tel. ${z.telefono}, ext. ${z.numeroExtension}`);
        }
      } catch (e) {
        console.error('Failed to load defaults', e);
      }
    };
    loadDefaults();
  }, [setSupervisorNombre, setSupervisorZona, setMunicipioEstado]);

  const handlePrint = () => {
    avisoMtService.generarAvisoSuspensionMt(
      formatFechaElaboracion(fechaElaboracion),
      municipioEstado,
      formatFechaSuspension(fechaSuspension),
      horario,
      ubicacion,
      telefono,
      supervisorNombre,
      supervisorZona,
      footerText
    );
  };

  const previewHtml = useMemo(() => {
    return avisoMtService.getAvisoHtml(
      formatFechaElaboracion(fechaElaboracion),
      municipioEstado,
      formatFechaSuspension(fechaSuspension),
      horario,
      ubicacion,
      telefono,
      supervisorNombre,
      supervisorZona,
      footerText,
      false
    );
  }, [fechaElaboracion, municipioEstado, fechaSuspension, horario, ubicacion, telefono, supervisorNombre, supervisorZona, footerText]);

  return (
    <Grid container spacing={4}>
      {/* Formulario (Lado Izquierdo) */}
      <Grid item xs={12} md={4}>
        <Box sx={{ 
          backgroundColor: 'white', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          height: { xs: 'auto', md: 'calc(100vh - 130px)' },
          overflowY: 'auto'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Datos del Aviso M.T.</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Elaboración"
                value={fechaElaboracion}
                onChange={(e) => {
                  const val = e.target.value;
                  setFechaElaboracion(val);
                  if (val && fechaSuspension && val > fechaSuspension) {
                    setFechaSuspension(val);
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Suspensión"
                value={fechaSuspension}
                onChange={(e) => {
                  const val = e.target.value;
                  setFechaSuspension(val);
                  if (val && fechaElaboracion && val < fechaElaboracion) {
                    setFechaElaboracion(val);
                  }
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: fechaElaboracion }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Horario"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                helperText="Ej: 10:30 a 17:30"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ubicación / Calles"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                helperText="Ej: Av. Lazaro C. Col. IMMS"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                helperText="Ej: 44-37-96-96-62"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ 
                  mt: 2, 
                  backgroundColor: '#9d2449',
                  '&:hover': {
                    backgroundColor: '#7a1c39'
                  }
                }}
              >
                Imprimir Aviso M.T.
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Vista Previa (Lado Derecho) */}
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{
          width: '100%',
          height: { xs: '600px', md: 'calc(100vh - 130px)' },
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Vista Previa de Impresión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aviso M.T. (Tamaño Carta)
            </Typography>
          </Box>
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            <Box 
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                zoom: 0.65
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
