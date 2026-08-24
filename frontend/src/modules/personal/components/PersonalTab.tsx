import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Tooltip,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import { personalService } from '../services/personal.service';
import { Personal } from '../types/personal.types';
import { zonasService } from '../../zonas/services/zonas.service';
import { Zona } from '../../zonas/types/zona.types';

export const PersonalTab: React.FC = () => {
  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Personal>({
    rpe: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    cargo: '',
    correo: '',
    zona: 'Zona Pátzcuaro',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const DEFAULT_ROLES = ['Administrador', 'Auxiliar Administrativo', 'Supervisor de Obra'];
  const [customRoles, setCustomRoles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('custom_roles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [addingRoleModal, setAddingRoleModal] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('');

  const allRoles = Array.from(
    new Set([
      ...DEFAULT_ROLES,
      ...customRoles,
      ...personalList.map((p) => p.cargo).filter(Boolean),
    ])
  );

  const handleAddRoleConfirm = () => {
    const trimmed = newRoleInput.trim();
    if (trimmed && !allRoles.includes(trimmed)) {
      const updated = [...customRoles, trimmed];
      setCustomRoles(updated);
      try {
        localStorage.setItem('custom_roles', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      setForm((prev) => ({ ...prev, cargo: trimmed }));
    } else if (trimmed) {
      setForm((prev) => ({ ...prev, cargo: trimmed }));
    }
    setNewRoleInput('');
    setAddingRoleModal(false);
  };

  const loadPersonal = async () => {
    setLoading(true);
    try {
      const [data, zonasData] = await Promise.all([
        personalService.getAll(),
        zonasService.getAll()
      ]);
      setPersonalList(data || []);
      setZonasList(zonasData || []);
    } catch (err) {
      console.error('Error cargando personal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonal();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setForm({
      rpe: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      cargo: '',
      correo: '',
      zona: 'Zona Pátzcuaro',
    });
    setErrors({});
    setOpenModal(true);
  };

  const handleOpenEdit = (item: Personal) => {
    setIsEdit(true);
    setForm({ ...item });
    setErrors({});
    setOpenModal(true);
  };

  const handleDelete = async (rpe: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro del RPE ${rpe}?`)) {
      try {
        await personalService.delete(rpe);
        await loadPersonal();
      } catch (err) {
        console.error('Error al eliminar personal:', err);
        alert('No se pudo eliminar el registro.');
      }
    }
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!form.rpe || form.rpe.trim() === '') {
      tempErrors.rpe = 'El RPE es requerido';
    }
    if (!form.nombres || form.nombres.trim() === '') {
      tempErrors.nombres = 'El nombre es requerido';
    }
    if (!form.apellidoPaterno || form.apellidoPaterno.trim() === '') {
      tempErrors.apellidoPaterno = 'El apellido paterno es requerido';
    }
    if (!form.cargo || form.cargo.trim() === '') {
      tempErrors.cargo = 'El cargo o rol es requerido';
    }
    if (!form.correo || form.correo.trim() === '') {
      tempErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(form.correo)) {
      tempErrors.correo = 'El formato del correo no es válido';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload: Personal = {
      rpe: form.rpe,
      nombres: form.nombres,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno || '',
      cargo: form.cargo,
      correo: form.correo,
      zona: form.zona || '',
    };

    try {
      if (isEdit) {
        await personalService.update(payload);
      } else {
        await personalService.create(payload);
      }
      setOpenModal(false);
      await loadPersonal();
    } catch (err) {
      console.error('Error al guardar personal:', err);
      alert('Error al guardar los datos del personal. Verifica que el RPE no esté duplicado.');
    }
  };

  const columns: Column<Personal>[] = [
    { key: 'rpe', label: 'RPE', align: 'left' },
    {
      key: 'nombres',
      label: 'Nombre Completo',
      align: 'left',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {`${row.nombres} ${row.apellidoPaterno} ${row.apellidoMaterno || ''}`}
        </span>
      ),
    },
    { key: 'cargo', label: 'Cargo o Rol', align: 'left' },
    { key: 'zona', label: 'Zona', align: 'left' },
    { key: 'correo', label: 'Correo', align: 'left' },
    {
      key: 'rpe',
      label: 'Acciones',
      align: 'center',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              sx={{ color: 'var(--color-primary)' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(row.rpe)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          Datos de Personal de CFE (Datos CF)
        </h1>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenCreate}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            py: 1.2,
            backgroundColor: 'var(--color-primary)',
            '&:hover': {
              backgroundColor: 'var(--color-primary-hover)',
            },
          }}
        >
          Registrar Personal
        </Button>
      </Box>

      <Card className="card" sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: 'var(--color-text-light)', mb: 3 }}>
            Administra el catálogo de personal de la Comisión Federal de Electricidad asignados a la supervisión, administración y control de obras.
          </Typography>

          {loading ? (
            <Typography variant="body2" align="center" sx={{ py: 4 }}>
              Cargando personal...
            </Typography>
          ) : (
            <ReusableTable columns={columns} rows={personalList} />
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog for Create & Edit */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
          {isEdit ? 'Editar Datos de Personal' : 'Registrar Personal de CFE'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="RPE (Registro Personal)"
                  fullWidth
                  disabled={isEdit}
                  value={form.rpe}
                  onChange={(e) => setForm({ ...form, rpe: e.target.value.toUpperCase() })}
                  error={!!errors.rpe}
                  helperText={errors.rpe}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombres"
                  fullWidth
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  error={!!errors.nombres}
                  helperText={errors.nombres}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido Paterno"
                  fullWidth
                  value={form.apellidoPaterno}
                  onChange={(e) => setForm({ ...form, apellidoPaterno: e.target.value })}
                  error={!!errors.apellidoPaterno}
                  helperText={errors.apellidoPaterno}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido Materno"
                  fullWidth
                  value={form.apellidoMaterno || ''}
                  onChange={(e) => setForm({ ...form, apellidoMaterno: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Cargo o Rol *"
                  fullWidth
                  value={form.cargo || ''}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW_ROLE') {
                      setAddingRoleModal(true);
                    } else {
                      setForm({ ...form, cargo: e.target.value });
                    }
                  }}
                  error={!!errors.cargo}
                  helperText={errors.cargo}
                  required
                >
                  <MenuItem value="">
                    <em>Seleccione un cargo o rol</em>
                  </MenuItem>
                  {allRoles.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                  <MenuItem
                    value="ADD_NEW_ROLE"
                    style={{
                      color: '#008E60',
                      fontWeight: 'bold',
                      borderTop: '1px solid #e2e8f0',
                      marginTop: '4px',
                    }}
                  >
                    + AGREGAR ROL
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Correo Electrónico"
                  fullWidth
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  error={!!errors.correo}
                  helperText={errors.correo}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Zona"
                  fullWidth
                  select
                  value={form.zona || ''}
                  onChange={(e) => setForm({ ...form, zona: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Seleccione una zona</em>
                  </MenuItem>
                  {zonasList.map((z) => (
                    <MenuItem key={z.sk || z.id} value={z.zona}>
                      {z.zona}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
              color: 'var(--color-secondary)',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
              backgroundColor: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-hover)',
              },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding a new Role */}
      <Dialog
        open={addingRoleModal}
        onClose={() => setAddingRoleModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
          Agregar Nuevo Rol
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nombre del Rol / Cargo"
            fullWidth
            value={newRoleInput}
            onChange={(e) => setNewRoleInput(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddingRoleModal(false)} sx={{ color: 'var(--color-secondary)' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddRoleConfirm}
            disabled={!newRoleInput.trim()}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-hover)' },
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
