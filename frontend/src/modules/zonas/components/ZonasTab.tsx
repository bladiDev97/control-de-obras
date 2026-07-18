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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import { zonasService } from '../services/zonas.service';
import { Zona } from '../types/zona.types';

export const ZonasTab: React.FC = () => {
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Zona>({
    zona: '',
    division: '',
    domicilio: '',
    colonia: '',
    municipio: '',
    estado: '',
    codigoPostal: '',
    telefono: '',
    numeroExtension: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadZonas = async () => {
    setLoading(true);
    try {
      const data = await zonasService.getAll();
      setZonasList(data || []);
    } catch (err) {
      console.error('Error cargando zonas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZonas();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setForm({
      zona: '',
      division: '',
      domicilio: '',
      colonia: '',
      municipio: '',
      estado: '',
      codigoPostal: '',
      telefono: '',
      numeroExtension: '',
    });
    setErrors({});
    setOpenModal(true);
  };

  const handleOpenEdit = (item: Zona) => {
    setIsEdit(true);
    setForm({ ...item });
    setErrors({});
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`¿Estás seguro de eliminar este registro de zona?`)) {
      try {
        await zonasService.delete(id);
        await loadZonas();
      } catch (err) {
        console.error('Error al eliminar zona:', err);
        alert('No se pudo eliminar el registro.');
      }
    }
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!form.zona || form.zona.trim() === '') tempErrors.zona = 'Requerido';
    if (!form.division || form.division.trim() === '') tempErrors.division = 'Requerido';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (isEdit && (form.sk || form.id)) {
        // Backend DynamoDB SK is like `zona#id`, but the repo takes id as string
        const idToUpdate = (form.sk ? form.sk.replace('zona#', '') : form.id) || '';
        await zonasService.update(idToUpdate, form);
      } else {
        await zonasService.create(form);
      }
      setOpenModal(false);
      await loadZonas();
    } catch (err) {
      console.error('Error al guardar zona:', err);
      alert('Hubo un error al guardar los datos.');
    }
  };

  const columns: Column<Zona>[] = [
    { key: 'zona', label: 'Zona' },
    { key: 'division', label: 'División' },
    { key: 'domicilio', label: 'Domicilio' },
    { key: 'municipio', label: 'Municipio' },
    { key: 'telefono', label: 'Teléfono' },
    {
      key: 'acciones' as any,
      label: 'Acciones',
      render: (row: any) => {
        const rowId = row.sk ? row.sk.replace('zona#', '') : row.id;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Editar">
              <IconButton color="primary" onClick={() => handleOpenEdit(row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton color="error" onClick={() => handleDelete(rowId)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">Directorio de Zonas</Typography>
        <Button
          variant="contained"
          startIcon={<AddLocationAltIcon />}
          onClick={handleOpenCreate}
          sx={{ backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-secondary)' } }}
        >
          Agregar Zona
        </Button>
      </Box>

      <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <CardContent>
          {loading ? (
            <Typography>Cargando datos de zonas...</Typography>
          ) : (
            <ReusableTable columns={columns} rows={zonasList} />
          )}
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Editar Zona' : 'Nueva Zona'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de Zona"
                value={form.zona}
                onChange={(e) => setForm({ ...form, zona: e.target.value })}
                error={!!errors.zona}
                helperText={errors.zona}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="División"
                value={form.division}
                onChange={(e) => setForm({ ...form, division: e.target.value })}
                error={!!errors.division}
                helperText={errors.division}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Domicilio"
                value={form.domicilio}
                onChange={(e) => setForm({ ...form, domicilio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Colonia"
                value={form.colonia}
                onChange={(e) => setForm({ ...form, colonia: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Municipio"
                value={form.municipio}
                onChange={(e) => setForm({ ...form, municipio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                value={form.codigoPostal}
                onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Extensión"
                value={form.numeroExtension}
                onChange={(e) => setForm({ ...form, numeroExtension: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
