import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { contratosService } from '../services/contratos.service';
import { Contrato } from '../types/contrato.types';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';

const CONCEPTOS_PREDEFINIDOS = [
  'POSTE NUEVO R.D.A.',
  'POSTE NUEVO RDA A MANIOBRA',
  'RETIRO DE POSTE RDA',
  'VESTIDO DE POSTE RDA',
  'DESVESTIDO DE POSTE R.D.A.',
  'INSTALACION ESTRUCTURA H',
  'INSTALACION DE ESTRUCTURA H A MANIOBRA',
  'INSTALACION DE TRANSFORMADOR',
  'RETIRO DE TRANSFORMADOR',
  'MURETE DE MEDICION DOMICILIARIA',
  'PREPARACION DE MEDICION DOMICILIARIA (INCLUYE SUMINISTRO DE MATERIALES)',
  'CONSTRUCCION KM DE LINEA',
  'RECALIBRACION  KM DE LINEA',
  'RETIRO KM DE LINEA',
  'POSTE NUEVO M.T.',
  'REGISTRO DE M. TENSION CON PAV.',
  'REGISTRO DE M. TENSION SIN PAV.',
  'REGISTRO EN B.T. C/PAVIMENTO',
  'REGISTRO DE B.T. S/PAVIMENTO',
  'POSTE DE ALUMBRADO PUBLICO',
  'REGISTRO DE ALUMBRADO PUBLICO',
  'DUCTO BAJO BANQUETA C/PAV. M.T.',
  'DUCTO BAJO BANQUETA S/PAV. M.T.',
  'DUCTO BAJO ARROYO C/PAV. M.T.',
  'DUCTO BAJO ARROYO S/PAV. M.T.',
  'DUCTO BAJO BANQUETA C/PAV. B.T.',
  'DUCTO BAJO BANQUETA S/PAV. B.T.',
  'DUCTO BAJO ARROYO C/PAV. B.T.',
  'DUCTO BAJO ARROYO S/PAV. B.T.',
  'TRANSICION EN MEDIA TENSION',
  'TRANSICION EN BAJA TENSION',
  'SUMINISTRO DE MATERIALES'
];

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form & Dialog States
  const [uploadOpen, setUploadOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Contract form fields
  const [formNumeroContrato, setFormNumeroContrato] = useState('');
  const [formLicitacion, setFormLicitacion] = useState('');
  const [formContratista, setFormContratista] = useState('');
  const [formDireccion, setFormDireccion] = useState('');
  const [formResidenteObra, setFormResidenteObra] = useState('');
  const [formMontoAutorizado, setFormMontoAutorizado] = useState(0);
  const [formFechaInicio, setFormFechaInicio] = useState('');
  const [formFechaFin, setFormFechaFin] = useState('');
  const [formCorreos, setFormCorreos] = useState<string[]>(['']);
  const [formPorcentajeAmpliacion, setFormPorcentajeAmpliacion] = useState(30);
  const [formPorcentajeAmpliacionTiempo, setFormPorcentajeAmpliacionTiempo] = useState(15);
  const [isEditMode, setIsEditMode] = useState(false);

  // Concepts list state (starts with predefined concepts but can be appended to)
  const [localConceptsList, setLocalConceptsList] = useState<string[]>(CONCEPTOS_PREDEFINIDOS);
  const [newConceptName, setNewConceptName] = useState('');

  // Concepts dialog states
  const [conceptsOpen, setConceptsOpen] = useState(false);
  const [backupConceptsList, setBackupConceptsList] = useState<string[]>([]);
  const [backupConceptFormValues, setBackupConceptFormValues] = useState<any>(null);
  const [conceptFormValues, setConceptFormValues] = useState<{
    [key: string]: { cantidad: number; costoUnitario: number; manoDeObra: number }
  }>(() => {
    const initial: any = {};
    CONCEPTOS_PREDEFINIDOS.forEach(c => {
      initial[c] = { cantidad: 0, costoUnitario: 0, manoDeObra: 0 };
    });
    return initial;
  });

  const loadContratos = async () => {
    setLoading(true);
    try {
      const data = await contratosService.getAll();
      setContratos(data);
    } catch (err) {
      console.error('Error cargando contratos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContratos();
  }, []);

  const handleSaveContrato = async () => {
    if (!formNumeroContrato || !formContratista) {
      setErrorMsg('Número de Contrato y Nombre de Contratista son obligatorios.');
      return;
    }
    setErrorMsg('');
    setImporting(true);
    try {
      const conceptos = Object.entries(conceptFormValues)
        .filter(([_, vals]) => vals.cantidad > 0)
        .map(([name, vals]) => ({
          codigo: name,
          costoUnitario: vals.costoUnitario,
          manoDeObra: vals.manoDeObra,
          cantidadContratada: vals.cantidad,
        }));

      const payload: Contrato = {
        numeroContrato: formNumeroContrato,
        contratista: formContratista || undefined,
        direccion: formDireccion || undefined,
        residenteObra: formResidenteObra || undefined,
        fechaInicio: formFechaInicio || undefined,
        fechaFin: formFechaFin || undefined,
        licitacion: formLicitacion || undefined,
        montoAutorizado: formMontoAutorizado || undefined,
        porcentajeAmpliacion: formPorcentajeAmpliacion || undefined,
        porcentajeAmpliacionTiempo: formPorcentajeAmpliacionTiempo || undefined,
        correos: formCorreos.filter((c) => c.trim() !== ''),
        conceptos,
      };

      if (isEditMode) {
        const { numeroContrato: _, ...updatePayload } = payload;
        await contratosService.update(formNumeroContrato, updatePayload as any);
      } else {
        await contratosService.create(payload);
      }

      setUploadOpen(false);
      // Reset form fields
      setFormNumeroContrato('');
      setFormContratista('');
      setFormDireccion('');
      setFormResidenteObra('');
      setFormFechaInicio('');
      setFormFechaFin('');
      setFormLicitacion('');
      setFormMontoAutorizado(0);
      setFormPorcentajeAmpliacion(30);
      setFormPorcentajeAmpliacionTiempo(15);
      setFormCorreos(['']);
      setIsEditMode(false);
      setLocalConceptsList(CONCEPTOS_PREDEFINIDOS);
      setConceptFormValues(() => {
        const initial: any = {};
        CONCEPTOS_PREDEFINIDOS.forEach(c => {
          initial[c] = { cantidad: 0, costoUnitario: 0, manoDeObra: 0 };
        });
        return initial;
      });

      loadContratos();
    } catch (err: any) {
      console.error('Error al registrar contrato:', err);
      const apiMsg = err.response?.data?.message;
      const details = Array.isArray(apiMsg) ? apiMsg.join(', ') : apiMsg;
      setErrorMsg(details || (isEditMode ? 'No se pudo actualizar el contrato. Verifica los datos.' : 'No se pudo registrar el contrato. Verifica los datos.'));
    } finally {
      setImporting(false);
    }
  };

  const handleEditClick = (contrato: Contrato) => {
    setIsEditMode(true);
    setFormNumeroContrato(contrato.numeroContrato);
    setFormContratista(contrato.contratista || '');
    setFormDireccion(contrato.direccion || '');
    setFormResidenteObra(contrato.residenteObra || '');
    setFormFechaInicio(contrato.fechaInicio || '');
    setFormFechaFin(contrato.fechaFin || '');
    setFormLicitacion(contrato.licitacion || '');
    setFormMontoAutorizado(contrato.montoAutorizado || 0);
    setFormPorcentajeAmpliacion(contrato.porcentajeAmpliacion !== undefined ? contrato.porcentajeAmpliacion : 30);
    setFormPorcentajeAmpliacionTiempo(contrato.porcentajeAmpliacionTiempo !== undefined ? contrato.porcentajeAmpliacionTiempo : 15);
    setFormCorreos(contrato.correos && contrato.correos.length > 0 ? contrato.correos : ['']);

    // Build the concepts list for editing: union of predefined and existing ones
    const existingConceptNames = (contrato.conceptos || []).map(c => c.codigo);
    const combinedList = Array.from(new Set([...CONCEPTOS_PREDEFINIDOS, ...existingConceptNames]));
    setLocalConceptsList(combinedList);

    // Initialize values for all concepts in the combined list
    const initialValues: any = {};
    combinedList.forEach(c => {
      const match = (contrato.conceptos || []).find(ec => ec.codigo === c);
      if (match) {
        initialValues[c] = {
          cantidad: match.cantidadContratada,
          costoUnitario: match.costoUnitario,
          manoDeObra: match.manoDeObra
        };
      } else {
        initialValues[c] = { cantidad: 0, costoUnitario: 0, manoDeObra: 0 };
      }
    });
    setConceptFormValues(initialValues);
    setErrorMsg('');
    setUploadOpen(true);
  };

  const handleDelete = async (numeroContrato: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el contrato ${numeroContrato}?`)) {
      try {
        await contratosService.delete(numeroContrato);
        loadContratos();
      } catch (err) {
        console.error('Error al eliminar contrato:', err);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const tableColumns: Column<Contrato>[] = [
    {
      key: 'numeroContrato',
      label: 'N° Contrato',
      render: (row: Contrato) => (
        <Typography
          onClick={() => navigate(`/contratos/${row.numeroContrato}`)}
          sx={{ fontWeight: 'bold', color: 'var(--color-primary)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {row.numeroContrato}
        </Typography>
      ),
    },
    { key: 'contratista', label: 'Contratista', render: (row: Contrato) => row.contratista || '-' },
    { key: 'licitacion', label: 'Licitación', render: (row: Contrato) => row.licitacion || '-' },
    {
      key: 'montoAutorizado',
      label: 'Autorizado (Sin IVA)',
      render: (row: Contrato) => formatCurrency(row.montoAutorizado),
    },
    {
      key: 'porcentajeAmpliacion',
      label: 'Límite Ampliado',
      render: (row: Contrato) => {
        const ampliado = row.montoAutorizado * (1 + row.porcentajeAmpliacion / 100);
        return `${formatCurrency(ampliado)} (${row.porcentajeAmpliacion}%)`;
      },
    },
    {
      key: 'numeroContrato',
      label: 'Acciones',
      render: (row: Contrato) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/contratos/${row.numeroContrato}`)}
            sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '0.75rem' }}
          >
            Ver Hojas
          </Button>
          <IconButton color="primary" onClick={() => handleEditClick(row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row.numeroContrato)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Control Financiero de Contratos</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setUploadOpen(true);
            setErrorMsg('');
            // Reset form fields
            setFormNumeroContrato('');
            setFormContratista('');
            setFormDireccion('');
            setFormResidenteObra('');
            setFormFechaInicio('');
            setFormFechaFin('');
            setFormLicitacion('');
            setFormMontoAutorizado(0);
            setFormPorcentajeAmpliacion(30);
            setFormPorcentajeAmpliacionTiempo(15);
            setFormCorreos(['']);
            setIsEditMode(false);
            setLocalConceptsList(CONCEPTOS_PREDEFINIDOS);
            setConceptFormValues(() => {
              const initial: any = {};
              CONCEPTOS_PREDEFINIDOS.forEach(c => {
                initial[c] = { cantidad: 0, costoUnitario: 0, manoDeObra: 0 };
              });
              return initial;
            });
          }}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            py: 1.2,
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-secondary)' },
          }}
        >
          Registrar Contrato
        </Button>
      </Box>

      <Card className="card" sx={{ mb: 4 }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 1, px: 2 }}>
            <AccountBalanceWalletIcon /> Resumen de Contratos Activos
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-light)', mb: 3, px: 2 }}>
            Gestiona los catálogos de conceptos contratados, montos autorizados, ampliaciones y estado financiero general de las obras.
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <ReusableTable columns={tableColumns} rows={contratos} />
          )}
        </CardContent>
      </Card>

      {/* Dialog: Registrar Contrato */}
      <Dialog open={uploadOpen} onClose={() => !importing && setUploadOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isEditMode ? 'Editar Contrato' : 'Registrar Contrato'}
          </Typography>
          <IconButton disabled={importing} onClick={() => setUploadOpen(false)} sx={{ color: '#757575' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {errorMsg && <Alert severity="error" sx={{ mb: 3, mt: 2 }}>{errorMsg}</Alert>}

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre de Contratista"
                  fullWidth
                  value={formContratista}
                  onChange={(e) => setFormContratista(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dirección"
                  fullWidth
                  value={formDireccion}
                  onChange={(e) => setFormDireccion(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Inicio"
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formFechaInicio}
                  onChange={(e) => setFormFechaInicio(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Término"
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formFechaFin}
                  onChange={(e) => setFormFechaFin(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Contrato"
                  fullWidth
                  disabled={isEditMode}
                  value={formNumeroContrato}
                  onChange={(e) => setFormNumeroContrato(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Licitación"
                  fullWidth
                  value={formLicitacion}
                  onChange={(e) => setFormLicitacion(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Importe del Contrato"
                  fullWidth
                  type="number"
                  value={formMontoAutorizado || ''}
                  onChange={(e) => setFormMontoAutorizado(parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Porcentaje de Ampliación en Monto (%)"
                  fullWidth
                  type="number"
                  value={formPorcentajeAmpliacion}
                  onChange={(e) => setFormPorcentajeAmpliacion(parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Porcentaje de Ampliación en Tiempo (%)"
                  fullWidth
                  type="number"
                  value={formPorcentajeAmpliacionTiempo}
                  onChange={(e) => setFormPorcentajeAmpliacionTiempo(parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre de Superintendente de Obra"
                  fullWidth
                  value={formResidenteObra}
                  onChange={(e) => setFormResidenteObra(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Correos de Contacto</Typography>
                {formCorreos.map((correo, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TextField
                      label={`Correo ${index + 1}`}
                      value={correo}
                      onChange={(e) => {
                        const newCorreos = [...formCorreos];
                        newCorreos[index] = e.target.value;
                        setFormCorreos(newCorreos);
                      }}
                      fullWidth
                      size="small"
                    />
                    {formCorreos.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newCorreos = formCorreos.filter((_, i) => i !== index);
                          setFormCorreos(newCorreos);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setFormCorreos([...formCorreos, ''])}
                  sx={{ mt: 0.5 }}
                >
                  Agregar Correo
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ borderTop: '1px solid #e2e8f0', pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Listado de Conceptos</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Conceptos asignados: {Object.values(conceptFormValues).filter(v => v.cantidad > 0).length}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setBackupConceptsList([...localConceptsList]);
                      setBackupConceptFormValues({ ...conceptFormValues });
                      setConceptsOpen(true);
                    }}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Asignar Listado de Conceptos
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button
            variant="outlined"
            onClick={() => setUploadOpen(false)}
            disabled={importing}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveContrato}
            disabled={importing || !formNumeroContrato || !formContratista}
            sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: 'var(--color-primary)' }}
          >
            {importing ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Registrar Contrato')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sub-Dialog: Asignar Listado de Conceptos */}
      <Dialog open={conceptsOpen} onClose={() => setConceptsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Asignar Listado de Conceptos</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ fontWeight: '800', backgroundColor: '#e2e8f0', color: '#0f172a', padding: '14px 16px', fontSize: '0.85rem' }}>Concepto</TableCell>
                  <TableCell align="center" style={{ fontWeight: '800', width: '120px', backgroundColor: '#e2e8f0', color: '#0f172a', padding: '14px 16px', fontSize: '0.85rem' }}>Cantidad</TableCell>
                  <TableCell align="center" style={{ fontWeight: '800', width: '150px', backgroundColor: '#e2e8f0', color: '#0f172a', padding: '14px 16px', fontSize: '0.85rem' }}>Precio Unitario</TableCell>
                  <TableCell align="center" style={{ fontWeight: '800', width: '150px', backgroundColor: '#e2e8f0', color: '#0f172a', padding: '14px 16px', fontSize: '0.85rem' }}>Mano de Obra</TableCell>
                  <TableCell align="center" style={{ fontWeight: '800', width: '75px', backgroundColor: '#e2e8f0', color: '#0f172a', padding: '14px 16px', fontSize: '0.85rem' }}>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {localConceptsList.map((concept, idx) => {
                  const values = conceptFormValues[concept] || { cantidad: 0, costoUnitario: 0, manoDeObra: 0 };
                  const isSuministro = concept === 'SUMINISTRO DE MATERIALES';
                  const isEven = idx % 2 === 0;
                  return (
                    <TableRow 
                      key={concept} 
                      hover
                      sx={{ 
                        backgroundColor: isEven ? '#f8fafc' : '#ffffff',
                        '&:hover': { backgroundColor: '#f0fdf4 !important' }
                      }}
                    >
                      <TableCell align="left" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', padding: '10px 16px' }}>{concept}</TableCell>
                      <TableCell align="center" style={{ padding: '10px 16px' }}>
                        <TextField
                          type="number"
                          size="small"
                          placeholder="0"
                          inputProps={{ 
                            min: 0, 
                            step: 'any',
                            style: { textAlign: 'center', fontWeight: 'bold' } 
                          }}
                          value={values.cantidad || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setConceptFormValues({
                              ...conceptFormValues,
                              [concept]: { ...values, cantidad: val }
                            });
                          }}
                          sx={{ width: '90px' }}
                        />
                      </TableCell>
                      <TableCell align="center" style={{ padding: '10px 16px' }}>
                        <TextField
                          type="number"
                          size="small"
                          placeholder="0.00"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          inputProps={{ 
                            min: 0, 
                            step: 'any',
                            style: { textAlign: 'right' } 
                          }}
                          value={values.costoUnitario || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setConceptFormValues({
                              ...conceptFormValues,
                              [concept]: { ...values, costoUnitario: val }
                            });
                          }}
                          sx={{ width: '120px' }}
                        />
                      </TableCell>
                      <TableCell align="center" style={{ padding: '10px 16px' }}>
                        {isSuministro ? (
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>-</Typography>
                        ) : (
                          <TextField
                            type="number"
                            size="small"
                            placeholder="0.00"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            inputProps={{ 
                              min: 0, 
                              step: 'any',
                              style: { textAlign: 'right' } 
                            }}
                            value={values.manoDeObra || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setConceptFormValues({
                                ...conceptFormValues,
                                [concept]: { ...values, manoDeObra: val }
                              });
                            }}
                            sx={{ width: '120px' }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center" style={{ padding: '10px 16px' }}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            setLocalConceptsList(localConceptsList.filter(c => c !== concept));
                            const updated = { ...conceptFormValues };
                            delete updated[concept];
                            setConceptFormValues(updated);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 2, alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', minWidth: '160px' }}>Agregar Otro Concepto:</Typography>
            <TextField
              size="small"
              placeholder="Ej: RETIRO DE ESCOMBRO..."
              value={newConceptName}
              onChange={(e) => setNewConceptName(e.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={() => {
                const name = newConceptName.trim().toUpperCase();
                if (!name) return;
                if (localConceptsList.includes(name)) {
                  alert('Este concepto ya existe en la lista.');
                  return;
                }
                setLocalConceptsList([...localConceptsList, name]);
                setConceptFormValues({
                  ...conceptFormValues,
                  [name]: { cantidad: 0, costoUnitario: 0, manoDeObra: 0 }
                });
                setNewConceptName('');
              }}
              sx={{ textTransform: 'none', borderRadius: '8px', minWidth: '100px' }}
            >
              Agregar
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setLocalConceptsList(backupConceptsList);
              setConceptFormValues(backupConceptFormValues);
              setConceptsOpen(false);
            }} 
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setConceptsOpen(false)} 
            sx={{ backgroundColor: 'var(--color-primary)', borderRadius: '8px', textTransform: 'none' }}
          >
            Confirmar Conceptos
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
    </svg>
  );
}
