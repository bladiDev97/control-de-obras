import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  FormControlLabel, 
  Switch, 
  Divider 
} from '@mui/material';

interface ConfiguracionFirmasProps {
  supervisorNombre: string;
  setSupervisorNombre: (v: string) => void;
  supervisorRpe: string;
  setSupervisorRpe: (v: string) => void;
  supervisorCargo: string;
  setSupervisorCargo: (v: string) => void;
  supervisorZona: string;
  setSupervisorZona: (v: string) => void;
  mostrarSupervisor: boolean;
  setMostrarSupervisor: (v: boolean) => void;

  adminNombre: string;
  setAdminNombre: (v: string) => void;
  adminRpe: string;
  setAdminRpe: (v: string) => void;
  adminCargo: string;
  setAdminCargo: (v: string) => void;
  adminZona: string;
  setAdminZona: (v: string) => void;
  mostrarAdmin: boolean;
  setMostrarAdmin: (v: boolean) => void;

  mostrarContratista: boolean;
  setMostrarContratista: (v: boolean) => void;

  hideAdmin?: boolean;
  hideContratista?: boolean;

  superintendenteNombre?: string;
  setSuperintendenteNombre?: (v: string) => void;
}

export const ConfiguracionFirmas: React.FC<ConfiguracionFirmasProps> = ({
  supervisorNombre, setSupervisorNombre,
  supervisorRpe, setSupervisorRpe,
  supervisorCargo, setSupervisorCargo,
  supervisorZona, setSupervisorZona,
  mostrarSupervisor, setMostrarSupervisor,

  adminNombre, setAdminNombre,
  adminRpe, setAdminRpe,
  adminCargo, setAdminCargo,
  adminZona, setAdminZona,
  mostrarAdmin, setMostrarAdmin,

  mostrarContratista, setMostrarContratista,
  hideAdmin = false,
  hideContratista = false,
  superintendenteNombre,
  setSuperintendenteNombre
}) => {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Supervisión de Obra
      </Typography>
      <FormControlLabel
        control={<Switch checked={mostrarSupervisor} onChange={e => setMostrarSupervisor(e.target.checked)} size="small" />}
        label={<Typography variant="body2">Mostrar firma supervisor</Typography>}
      />
      {mostrarSupervisor && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            size="small"
            label="Nombre"
            value={supervisorNombre}
            onChange={e => setSupervisorNombre(e.target.value)}
          />
        </Box>
      )}

      {!hideAdmin && (
        <>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Administración de Zona
          </Typography>
          <FormControlLabel
            control={<Switch checked={mostrarAdmin} onChange={e => setMostrarAdmin(e.target.checked)} size="small" />}
            label={<Typography variant="body2">Mostrar firma administrador</Typography>}
          />
          {mostrarAdmin && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                size="small"
                label="Nombre"
                value={adminNombre}
                onChange={e => setAdminNombre(e.target.value)}
              />
            </Box>
          )}
        </>
      )}

      {!hideContratista && (
        <>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Contratista
          </Typography>
          <FormControlLabel
            control={<Switch checked={mostrarContratista} onChange={e => setMostrarContratista(e.target.checked)} size="small" />}
            label={<Typography variant="body2">Mostrar firma contratista</Typography>}
          />
          {mostrarContratista && setSuperintendenteNombre && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                size="small"
                label="Superintendente"
                value={superintendenteNombre || ''}
                onChange={e => setSuperintendenteNombre(e.target.value)}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
