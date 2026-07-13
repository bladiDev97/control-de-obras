import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import { contratosService } from '../services/contratos.service';
import { obrasService } from '../../obras/services/obras.service';
import { Contrato, Asignacion, Estimacion } from '../types/contrato.types';
import { api } from '../../../services/api';

export default function ContratoDetailPage() {
  const { numeroContrato } = useParams<{ numeroContrato: string }>();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [allObras, setAllObras] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const loadData = async () => {
    if (!numeroContrato) return;
    setLoading(true);
    try {
      const cData = await contratosService.getOne(numeroContrato);
      const aData = await contratosService.getAsignaciones(numeroContrato);
      const eData = await contratosService.getEstimaciones(numeroContrato);
      const oData = await obrasService.getAll();
      
      setContrato(cData);
      setAsignaciones(aData);
      setEstimaciones(eData);
      setAllObras(oData);
    } catch (err) {
      console.error('Error cargando datos del contrato:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [numeroContrato]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" sx={{ color: '#757575' }}>Cargando estado financiero del contrato...</Typography>
      </Box>
    );
  }

  if (!contrato) {
    return (
      <Box sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/contratos')} sx={{ mb: 2 }}>Regresar</Button>
        <Typography color="error" variant="h6">El contrato solicitado no existe.</Typography>
      </Box>
    );
  }

  // --- Dynamic calculations and merge ---
  const assignedObras = allObras.filter(
    (o) => o.contrato && o.contrato.trim() === contrato.numeroContrato
  );

  const displayAsignaciones: Asignacion[] = assignedObras.map((o) => {
    const atKey = o.at && o.at.trim() !== '' ? o.at.trim() : o.solicitudPo;
    const saved = asignaciones.find((a) => a.at === atKey);

    return {
      id: saved?.id || `placeholder#${atKey}`,
      numeroContrato: contrato.numeroContrato,
      at: atKey,
      tipoObra: o.tipoObra,
      obra: o.obra,
      orden: o.orden,
      activo: o.activo,
      conceptos: saved?.conceptos || {},
    };
  });

  const getConceptSumAsignada = (conceptCode: string) => {
    return displayAsignaciones.reduce((acc, curr) => acc + (curr.conceptos[conceptCode] || 0), 0);
  };

  const getConceptSumEstimada = (conceptCode: string) => {
    return estimaciones.reduce((acc, curr) => acc + (curr.conceptos[conceptCode] || 0), 0);
  };

  const totalContratado = contrato.montoAutorizado;
  const totalAmpliado = totalContratado * (1 + contrato.porcentajeAmpliacion / 100);

  const totalEjecutado = contrato.conceptos.reduce((acc, curr) => {
    const qty = getConceptSumEstimada(curr.codigo);
    return acc + (qty * curr.costoUnitario);
  }, 0);

  const totalManoObraEjecutada = contrato.conceptos.reduce((acc, curr) => {
    const qty = getConceptSumEstimada(curr.codigo);
    return acc + (qty * curr.manoDeObra);
  }, 0);

  const restoSinAmpliacion = totalContratado - totalEjecutado;
  const restoConAmpliacion = totalAmpliado - totalEjecutado;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const formatCurrencyOrBlank = (val: number) => {
    if (!val || val === 0) return '';
    return formatCurrency(val);
  };

  const getAsignacionManoObraVal = (asign: Asignacion) => {
    return contrato.conceptos.reduce((acc, curr) => {
      const qty = asign.conceptos[curr.codigo] || 0;
      return acc + (qty * curr.manoDeObra);
    }, 0);
  };

  // --- Calculations for Estimations ---
  const getEstimacionTotalVal = (est: Estimacion) => {
    return contrato.conceptos.reduce((acc, curr) => {
      const qty = est.conceptos[curr.codigo] || 0;
      return acc + (qty * curr.costoUnitario);
    }, 0);
  };

  const getEstimacionManoObraVal = (est: Estimacion) => {
    return contrato.conceptos.reduce((acc, curr) => {
      const qty = est.conceptos[curr.codigo] || 0;
      return acc + (qty * curr.manoDeObra);
    }, 0);
  };

  // --- Real-time Inline Cell Editing Handlers ---
  const updateAsignacionQuantity = async (atCode: string, conceptCode: string, value: number) => {
    setAsignaciones((prev) => {
      const idx = prev.findIndex((a) => a.at === atCode);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          conceptos: {
            ...updated[idx].conceptos,
            [conceptCode]: value,
          },
        };
        return updated;
      } else {
        const matchedObra = allObras.find((o) => {
          const k = o.at && o.at.trim() !== '' ? o.at.trim() : o.solicitudPo;
          return k === atCode;
        });
        const newAsign: Asignacion = {
          numeroContrato: contrato.numeroContrato,
          at: atCode,
          tipoObra: matchedObra?.tipoObra || 'N/A',
          obra: matchedObra?.obra || 'N/A',
          orden: matchedObra?.orden || 'N/A',
          activo: matchedObra?.activo || 'N/A',
          conceptos: { [conceptCode]: value },
        };
        return [...prev, newAsign];
      }
    });

    const matchedObra = allObras.find((o) => {
      const k = o.at && o.at.trim() !== '' ? o.at.trim() : o.solicitudPo;
      return k === atCode;
    });
    const existing = displayAsignaciones.find((a) => a.at === atCode);
    const updatedConceptos = {
      ...(existing?.conceptos || {}),
      [conceptCode]: value,
    };

    const payload = {
      tipoObra: matchedObra?.tipoObra || 'N/A',
      obra: matchedObra?.obra || 'N/A',
      orden: matchedObra?.orden || 'N/A',
      activo: matchedObra?.activo || 'N/A',
      conceptos: updatedConceptos,
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/asignaciones/${atCode}`, payload);
    } catch (err) {
      console.error('Error al guardar cantidad en base de datos:', err);
    }
  };

  const updateEstimacionQuantity = async (idKey: string, conceptCode: string, value: number) => {
    setEstimaciones((prev) => {
      const idx = prev.findIndex((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          conceptos: {
            ...updated[idx].conceptos,
            [conceptCode]: value,
          },
        };
        return updated;
      }
      return prev;
    });

    const target = estimaciones.find((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
    if (!target) return;

    const updatedConceptos = {
      ...(target.conceptos || {}),
      [conceptCode]: value,
    };

    const payload = {
      obra: target.obra || 'N/A',
      avanceMvmo: target.avanceMvmo || '',
      bitacoraSupervision: target.bitacoraSupervision || '',
      bitacoraAutorizacion: target.bitacoraAutorizacion || '',
      compSind: target.compSind || 0,
      retenerIva: target.retenerIva || false,
      conceptos: updatedConceptos,
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/estimaciones/${target.at}/${target.numeroEstimacion}`, payload);
    } catch (err) {
      console.error('Error al guardar estimación:', err);
    }
  };

  const updateEstimacionField = async (idKey: string, field: string, value: string) => {
    setEstimaciones((prev) => {
      const idx = prev.findIndex((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          [field]: value,
        };
        return updated;
      }
      return prev;
    });

    const target = estimaciones.find((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
    if (!target) return;

    const payload = {
      obra: target.obra || 'N/A',
      avanceMvmo: field === 'avanceMvmo' ? value : target.avanceMvmo || '',
      bitacoraSupervision: field === 'bitacoraSupervision' ? value : target.bitacoraSupervision || '',
      bitacoraAutorizacion: field === 'bitacoraAutorizacion' ? value : target.bitacoraAutorizacion || '',
      compSind: target.compSind || 0,
      retenerIva: target.retenerIva || false,
      conceptos: target.conceptos || {},
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/estimaciones/${target.at}/${target.numeroEstimacion}`, payload);
    } catch (err) {
      console.error('Error al actualizar campo de estimación:', err);
    }
  };

  const updateEstimacionCompSind = async (idKey: string, value: number) => {
    setEstimaciones((prev) => {
      const idx = prev.findIndex((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          compSind: value,
        };
        return updated;
      }
      return prev;
    });

    const target = estimaciones.find((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
    if (!target) return;

    const payload = {
      obra: target.obra || 'N/A',
      avanceMvmo: target.avanceMvmo || '',
      bitacoraSupervision: target.bitacoraSupervision || '',
      bitacoraAutorizacion: target.bitacoraAutorizacion || '',
      compSind: value,
      retenerIva: target.retenerIva || false,
      conceptos: target.conceptos || {},
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/estimaciones/${target.at}/${target.numeroEstimacion}`, payload);
    } catch (err) {
      console.error('Error al actualizar compensación sindical:', err);
    }
  };

  const updateEstimacionRetenerIva = async (idKey: string, value: boolean) => {
    setEstimaciones((prev) => {
      const idx = prev.findIndex((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          retenerIva: value,
        };
        return updated;
      }
      return prev;
    });

    const target = estimaciones.find((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
    if (!target) return;

    const payload = {
      obra: target.obra || 'N/A',
      avanceMvmo: target.avanceMvmo || '',
      bitacoraSupervision: target.bitacoraSupervision || '',
      bitacoraAutorizacion: target.bitacoraAutorizacion || '',
      compSind: target.compSind || 0,
      retenerIva: value,
      conceptos: target.conceptos || {},
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/estimaciones/${target.at}/${target.numeroEstimacion}`, payload);
    } catch (err) {
      console.error('Error al actualizar retención de IVA:', err);
    }
  };

  // --- Inline Adding Row for Estimations ---
  const handleAddBlankEstimRow = () => {
    const tempId = `temp#${Date.now()}`;
    const tempRow: Estimacion = {
      id: tempId,
      numeroContrato: contrato.numeroContrato,
      at: '',
      obra: '',
      numeroEstimacion: '',
      bitacoraSupervision: '',
      bitacoraAutorizacion: '',
      avanceMvmo: '',
      compSind: 0,
      retenerIva: false,
      conceptos: {},
    };
    setEstimaciones((prev) => [...prev, tempRow]);
  };

  const handleSelectAtForEstimRow = async (tempId: string, atCode: string) => {
    const cleanAt = atCode.trim();
    if (!cleanAt) return;

    const matchedAsign = displayAsignaciones.find((a) => a.at.trim().toUpperCase() === cleanAt.toUpperCase());
    const nextNum = String(estimaciones.filter((e) => e.at.trim().toUpperCase() === cleanAt.toUpperCase()).length + 1);
    
    const conceptsCopy = matchedAsign ? { ...matchedAsign.conceptos } : {};

    const payload = {
      obra: matchedAsign?.obra || 'N/A',
      avanceMvmo: '',
      bitacoraSupervision: '',
      bitacoraAutorizacion: '',
      compSind: 0,
      retenerIva: false,
      conceptos: conceptsCopy,
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/estimaciones/${cleanAt}/${nextNum}`, payload);
      loadData();
    } catch (err) {
      console.error('Error al agregar fila de estimación:', err);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/contratos')}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: '800',
              borderWidth: '2px !important',
              color: 'var(--color-text-dark)',
              borderColor: 'var(--color-border)',
              '&:hover': {
                backgroundColor: 'rgba(0, 142, 96, 0.05)',
                borderColor: 'var(--verde-cfe)',
              }
            }}
          >
            Regresar
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, var(--verde-cfe) 0%, #005a3c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📂 Contrato: {contrato.numeroContrato}
          </Typography>
        </Box>
      </Box>

      {/* Contract Metadata Header Card */}
      <Card className="card" sx={{ mb: 4, borderRadius: '20px', border: '1px solid var(--color-border)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 1, mb: 3, fontWeight: '800' }}>
            <AccountBalanceIcon sx={{ color: 'var(--verde-cfe)' }} /> Datos de Adjudicación e Información General
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>🏢 Contratista / Empresa</Typography>
              <Typography variant="body1" sx={{ fontWeight: '800', color: 'var(--color-text-dark)' }}>{contrato.contratista || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>📄 Licitación Pública</Typography>
              <Typography variant="body1" sx={{ fontWeight: '800', color: 'var(--color-text-dark)' }}>{contrato.licitacion || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>📅 Plazo de Ejecución</Typography>
              <Typography variant="body1" sx={{ fontWeight: '800', color: 'var(--color-text-dark)' }}>{contrato.plazoDias || 0} Días Naturales</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>🏁 Fecha Inicio</Typography>
              <Typography variant="body1" sx={{ fontWeight: '800', color: 'var(--color-text-dark)' }}>{contrato.fechaInicio || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>🔚 Fecha Término</Typography>
              <Typography variant="body1" sx={{ fontWeight: '800', color: 'var(--color-text-dark)' }}>{contrato.fechaFin || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>📈 Ampliación Presupuestal</Typography>
              <Typography variant="body1" sx={{ fontWeight: '800', color: '#2563eb', display: 'inline-block', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>+{contrato.porcentajeAmpliacion}% Autorizado</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Financial Status Indicators - Bento Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', borderLeft: '6px solid #2563eb', borderRadius: '18px', padding: '20px' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>MONTO AUTORIZADO (SIN IVA)</Typography>
                <span style={{ fontSize: '1.25rem' }}>💰</span>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#1e3a8a', mb: 1 }}>{formatCurrency(totalContratado)}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: '500' }}>Monto base contratado original</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderLeft: '6px solid #16a34a', borderRadius: '18px', padding: '20px' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>MONTO EJECUTADO / ESTIMADO</Typography>
                <span style={{ fontSize: '1.25rem' }}>🛠️</span>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#14532d', mb: 1 }}>{formatCurrency(totalEjecutado)}</Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: '600', display: 'block', lineHeight: '1.2' }}>
                De los cuales <strong>{formatCurrency(totalManoObraEjecutada)}</strong> corresponden a Mano de Obra
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)', borderLeft: '6px solid var(--verde-cfe)', borderRadius: '18px', padding: '20px' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'var(--verde-cfe)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>MONTO AUTORIZADO CON AMPLIACIÓN ({contrato.porcentajeAmpliacion}%)</Typography>
                <span style={{ fontSize: '1.25rem' }}>🚀</span>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#064e3b', mb: 1 }}>{formatCurrency(totalAmpliado)}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: '500' }}>Presupuesto límite autorizado</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderLeft: '6px solid #dc2626', borderRadius: '18px', padding: '20px' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>MONTO POR EJERCER (SIN AMPLIACIÓN)</Typography>
                <span style={{ fontSize: '1.25rem' }}>⏳</span>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#7f1d1d', mb: 1 }}>{formatCurrency(restoSinAmpliacion)}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: '500' }}>Restante del monto base contratado</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', borderLeft: '6px solid #059669', borderRadius: '18px', padding: '20px' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>MONTO POR EJERCER (CON AMPLIACIÓN DEL {contrato.porcentajeAmpliacion}%)</Typography>
                <span style={{ fontSize: '1.25rem' }}>📈</span>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#064e3b', mb: 1 }}>{formatCurrency(restoConAmpliacion)}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: '500' }}>Restante total disponible para ejecutar obras</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, index) => setTabIndex(index)} variant="fullWidth">
          <Tab icon={<ListAltIcon />} iconPosition="start" label="Catálogo de Conceptos" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="Hoja: Asignación (Obras)" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Hoja: Estimaciones" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
        </Tabs>
      </Box>

      {/* Tab 0: Catalog Sheet */}
      {tabIndex === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'var(--color-secondary)' }}>
            Catálogo de Conceptos, Costos Unitarios y Cantidades
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600, mb: 4, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', minWidth: 200 }}>Concepto</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', textAlign: 'right' }}>P.U. Total</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', textAlign: 'right' }}>M.O. Parte</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Cant. Contratada</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Cant. Asignada</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Cant. Estimada</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', textAlign: 'right' }}>Imp. Contratado</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', textAlign: 'right' }}>Imp. Ejecutado</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', minWidth: 120 }}>Avance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contrato.conceptos.map((concepto, index) => {
                  const qtyAsignada = getConceptSumAsignada(concepto.codigo);
                  const qtyEstimada = getConceptSumEstimada(concepto.codigo);
                  const impContratado = concepto.cantidadContratada * concepto.costoUnitario;
                  const impEjecutado = qtyEstimada * concepto.costoUnitario;
                  const avancePct = concepto.cantidadContratada > 0 ? (qtyEstimada / concepto.cantidadContratada) * 100 : 0;
                  
                  return (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{concepto.codigo}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(concepto.costoUnitario)}</TableCell>
                      <TableCell sx={{ textAlign: 'right', color: '#666' }}>{formatCurrency(concepto.manoDeObra)}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>{concepto.cantidadContratada}</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: qtyAsignada > concepto.cantidadContratada ? '#d32f2f' : 'inherit', fontWeight: 'bold' }}>
                        {qtyAsignada}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#2e7d32', fontWeight: 'bold' }}>{qtyEstimada}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(impContratado)}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>{formatCurrency(impEjecutado)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, avancePct)}
                              color={avancePct > 100 ? 'error' : avancePct > 70 ? 'success' : 'primary'}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="textSecondary">{avancePct.toFixed(0)}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 1: Asignación Sheet */}
      {tabIndex === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>
              Hoja de Asignación de Conceptos por Obra (Edición Directa en Celdas)
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-light)' }}>
              Total de obras asignadas: <strong>{displayAsignaciones.length}</strong>
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 600, mb: 4, borderRadius: '12px', overflowX: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Sticky headers on left side */}
                  <TableCell sx={{ minWidth: 100, position: 'sticky', left: 0, zIndex: 15 }}>AT</TableCell>
                  <TableCell sx={{ minWidth: 60, position: 'sticky', left: 100, zIndex: 15 }}>Tipo</TableCell>
                  <TableCell sx={{ minWidth: 80, position: 'sticky', left: 160, zIndex: 15 }}>Obra</TableCell>
                  <TableCell sx={{ minWidth: 110, position: 'sticky', left: 240, zIndex: 15 }}>Orden</TableCell>
                  <TableCell sx={{ minWidth: 90, position: 'sticky', left: 350, zIndex: 15 }}>Activo</TableCell>
                  
                  {/* Concept code columns */}
                  {contrato.conceptos.map((concept) => (
                    <TableCell
                      key={concept.codigo}
                      sx={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        minWidth: 120,
                        lineHeight: 1.2
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{concept.codigo}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--verde-cfe)', marginTop: '4px', fontWeight: 'bold' }}>
                        {formatCurrency(concept.manoDeObra)}
                      </div>
                    </TableCell>
                  ))}

                  {/* Total column on the right end */}
                  <TableCell sx={{ minWidth: 130, position: 'sticky', right: 0, zIndex: 15, textAlign: 'right', borderLeft: '2px solid #e2e8f0', fontWeight: 'bold', color: 'var(--verde-cfe) !important' }}>
                    TOTAL MANO DE OBRA
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayAsignaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6 + contrato.conceptos.length} sx={{ textAlign: 'center', py: 4 }}>
                      No hay asignaciones cargadas para este contrato.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayAsignaciones.map((asign) => (
                    <TableRow key={asign.id} hover>
                      {/* Sticky cells on body */}
                      <TableCell sx={{ fontWeight: 'bold', color: 'var(--color-primary)', position: 'sticky', left: 0, zIndex: 11, backgroundColor: '#fff' }}>{asign.at}</TableCell>
                      <TableCell sx={{ position: 'sticky', left: 100, zIndex: 11, backgroundColor: '#fff' }}>{asign.tipoObra || '-'}</TableCell>
                      <TableCell sx={{ position: 'sticky', left: 160, zIndex: 11, backgroundColor: '#fff' }}>{asign.obra || '-'}</TableCell>
                      <TableCell sx={{ position: 'sticky', left: 240, zIndex: 11, backgroundColor: '#fff' }}>{asign.orden || '-'}</TableCell>
                      <TableCell sx={{ position: 'sticky', left: 350, zIndex: 11, backgroundColor: '#fff' }}>{asign.activo || '-'}</TableCell>
                      
                      {/* Concept editable cells */}
                      {contrato.conceptos.map((concept) => {
                        const qty = asign.conceptos[concept.codigo] || 0;
                        return (
                          <TableCell
                            key={concept.codigo}
                            sx={{
                              p: 0,
                              textAlign: 'center',
                              bgcolor: qty > 0 ? '#d1fae5' : 'transparent',
                              minWidth: 80,
                              borderRight: '1px solid #e2e8f0',
                            }}
                          >
                            <input
                              type="number"
                              value={qty === 0 ? '' : qty}
                              placeholder=""
                              onChange={(e) => {
                                const newVal = parseFloat(e.target.value) || 0;
                                updateAsignacionQuantity(asign.at, concept.codigo, newVal);
                              }}
                              style={{
                                width: '100%',
                                height: '36px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'center',
                                fontWeight: qty > 0 ? 'bold' : 'normal',
                                outline: 'none',
                                color: qty > 0 ? '#005a3c' : 'inherit',
                                fontSize: '0.9rem',
                              }}
                            />
                          </TableCell>
                        );
                      })}

                      {/* Sticky total value on the right end */}
                      <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: '#e65100', position: 'sticky', right: 0, zIndex: 11, backgroundColor: '#fff', borderLeft: '2px solid #e2e8f0', boxShadow: '-2px 0 4px rgba(0,0,0,0.05)' }}>
                        {formatCurrencyOrBlank(getAsignacionManoObraVal(asign))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 2: Estimaciones Sheet */}
      {tabIndex === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                Registro de Estimaciones (Edición Directa en Celdas)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddBlankEstimRow}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
              >
                Agregar Fila
              </Button>
            </Box>
            <Typography variant="body2" sx={{ color: 'var(--color-text-light)' }}>
              Total de estimaciones: <strong>{estimaciones.length}</strong>
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 600, mb: 4, borderRadius: '12px', overflowX: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Sticky headers for Tab 2 - Left side */}
                  <TableCell sx={{ minWidth: 70, position: 'sticky', left: 0, zIndex: 15 }}>N° Est</TableCell>
                  <TableCell sx={{ minWidth: 100, position: 'sticky', left: 70, zIndex: 15 }}>AT</TableCell>
                  <TableCell sx={{ minWidth: 60, position: 'sticky', left: 170, zIndex: 15 }}>Tipo</TableCell>
                  <TableCell sx={{ minWidth: 80, position: 'sticky', left: 230, zIndex: 15 }}>Obra</TableCell>
                  <TableCell sx={{ minWidth: 110, position: 'sticky', left: 310, zIndex: 15 }}>Orden</TableCell>
                  <TableCell sx={{ minWidth: 90, position: 'sticky', left: 420, zIndex: 15 }}>Activo</TableCell>

                  {/* Concept code columns */}
                  {contrato.conceptos.map((concept) => (
                    <TableCell
                      key={concept.codigo}
                      sx={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        minWidth: 120,
                        lineHeight: 1.2
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{concept.codigo}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--verde-cfe)', marginTop: '4px', fontWeight: 'bold' }}>
                        {formatCurrency(concept.manoDeObra)}
                      </div>
                    </TableCell>
                  ))}

                  {/* Financial calculation headers on the right end */}
                  <TableCell sx={{ minWidth: 130, textAlign: 'right', borderLeft: '2px solid #e2e8f0', fontWeight: 'bold' }}>IMPORTE TOTAL</TableCell>
                  <TableCell sx={{ minWidth: 130, textAlign: 'right', fontWeight: 'bold' }}>MONTO EJERCIDO</TableCell>
                  <TableCell sx={{ minWidth: 130, textAlign: 'right', fontWeight: 'bold' }}>IMPORTE DE M.O.</TableCell>
                  <TableCell sx={{ minWidth: 140, textAlign: 'right', fontWeight: 'bold' }}>I.V.A. (16%)</TableCell>
                  <TableCell sx={{ minWidth: 130, textAlign: 'right', fontWeight: 'bold' }}>SUBTOTAL</TableCell>
                  <TableCell sx={{ minWidth: 110, textAlign: 'right', fontWeight: 'bold' }}>S.F.P. (0.5%)</TableCell>
                  <TableCell sx={{ minWidth: 110, textAlign: 'right', fontWeight: 'bold' }}>CUOTA SIND.</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: 'center', fontWeight: 'bold' }}>COMP. SIND.</TableCell>
                  <TableCell sx={{ minWidth: 100, textAlign: 'center', fontWeight: 'bold' }}>RETENER IVA</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: 'right', fontWeight: 'bold' }}>IVA RETENIDO</TableCell>
                  <TableCell sx={{ minWidth: 130, textAlign: 'right', fontWeight: 'bold' }}>DEDUCCIONES</TableCell>
                  <TableCell sx={{ minWidth: 130, position: 'sticky', right: 0, zIndex: 15, textAlign: 'right', borderLeft: '2px solid #e2e8f0', fontWeight: 'bold', color: 'var(--verde-cfe) !important' }}>LIQUIDO A PAGAR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6 + contrato.conceptos.length + 12} sx={{ textAlign: 'center', py: 4 }}>
                      Haz clic en "Agregar Fila" para empezar a registrar estimaciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  estimaciones.map((est) => {
                    const estId = est.id || `${est.at}#${est.numeroEstimacion}`;
                    const isNewRow = estId.startsWith('temp#');

                    // Look up matching assignment dynamically to fill Tipo, Orden, Activo if saved
                    const cleanAt = est.at.trim().toUpperCase();
                    const matchedAsign = displayAsignaciones.find((a) => a.at.trim().toUpperCase() === cleanAt);

                    // Dynamic financial values
                    const impTotal = getEstimacionTotalVal(est);
                    const montEjercido = impTotal;
                    const impMo = getEstimacionManoObraVal(est);
                    const ivaEst = impTotal * 0.16;
                    const sub = impTotal + ivaEst;
                    
                    const sfpVal = impTotal * 0.005;
                    const cuotaSindVal = impMo * 0.02;
                    const compSindVal = est.compSind || 0;
                    
                    // VAT Retention (2/3 of IVA)
                    const ivaRetenidoVal = est.retenerIva ? ivaEst * (2 / 3) : 0;
                    
                    const totDeduc = sfpVal + cuotaSindVal + compSindVal + ivaRetenidoVal;
                    const liqPagar = sub - totDeduc;

                    return (
                      <TableRow key={estId} hover>
                        {/* Sticky body cells for Tab 2 */}
                        <TableCell sx={{ fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 11, backgroundColor: '#fff' }}>
                          {est.numeroEstimacion || '-'}
                        </TableCell>
                        
                        {/* AT cell (editable text input if new row, static text if saved) */}
                        <TableCell sx={{ p: 0, position: 'sticky', left: 70, zIndex: 11, backgroundColor: '#fff', borderRight: '1px solid #e2e8f0' }}>
                          {isNewRow ? (
                            <input
                              type="text"
                              value={est.at}
                              placeholder="Escribe AT..."
                              onChange={(e) => {
                                const val = e.target.value;
                                setEstimaciones((prev) =>
                                  prev.map((item) => (item.id === estId ? { ...item, at: val } : item))
                                );
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== '') {
                                  handleSelectAtForEstimRow(estId, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value.trim();
                                  if (val !== '') {
                                    handleSelectAtForEstimRow(estId, val);
                                  }
                                }
                              }}
                              style={{
                                width: '100%',
                                height: '36px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                outline: 'none',
                                color: 'inherit',
                                fontSize: '0.9rem',
                              }}
                            />
                          ) : (
                            <Box sx={{ px: 1.5, fontWeight: 'bold', color: 'var(--color-primary)' }}>
                              {est.at}
                            </Box>
                          )}
                        </TableCell>

                        {/* Tipo cell */}
                        <TableCell sx={{ position: 'sticky', left: 170, zIndex: 11, backgroundColor: '#fff' }}>
                          {matchedAsign?.tipoObra || est.tipoObra || '-'}
                        </TableCell>

                        {/* Obra cell */}
                        <TableCell sx={{ position: 'sticky', left: 230, zIndex: 11, backgroundColor: '#fff' }}>
                          {est.obra || '-'}
                        </TableCell>

                        {/* Orden cell */}
                        <TableCell sx={{ position: 'sticky', left: 310, zIndex: 11, backgroundColor: '#fff' }}>
                          {matchedAsign?.orden || est.orden || '-'}
                        </TableCell>

                        {/* Activo cell */}
                        <TableCell sx={{ position: 'sticky', left: 420, zIndex: 11, backgroundColor: '#fff' }}>
                          {matchedAsign?.activo || est.activo || '-'}
                        </TableCell>

                        {/* Concept editable cells */}
                        {contrato.conceptos.map((concept) => {
                          const qty = est.conceptos[concept.codigo] || 0;
                          return (
                            <TableCell
                              key={concept.codigo}
                              sx={{
                                p: 0,
                                textAlign: 'center',
                                bgcolor: qty > 0 ? '#d1fae5' : 'transparent',
                                minWidth: 80,
                                borderRight: '1px solid #e2e8f0',
                              }}
                            >
                              <input
                                type="number"
                                value={qty === 0 ? '' : qty}
                                placeholder=""
                                disabled={isNewRow}
                                onChange={(e) => {
                                  const newVal = parseFloat(e.target.value) || 0;
                                  updateEstimacionQuantity(estId, concept.codigo, newVal);
                                }}
                                style={{
                                  width: '100%',
                                  height: '36px',
                                  border: 'none',
                                  background: 'transparent',
                                  textAlign: 'center',
                                  fontWeight: qty > 0 ? 'bold' : 'normal',
                                  outline: 'none',
                                  color: qty > 0 ? '#005a3c' : 'inherit',
                                  fontSize: '0.9rem',
                                }}
                              />
                            </TableCell>
                          );
                        })}

                        {/* Financial calculations output cells */}
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: impTotal > 0 ? '#1565c0' : 'inherit', borderLeft: '2px solid #e2e8f0' }}>{formatCurrencyOrBlank(impTotal)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', color: montEjercido > 0 ? '#1565c0' : 'inherit' }}>{formatCurrencyOrBlank(montEjercido)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', color: impMo > 0 ? '#0d47a1' : 'inherit' }}>{formatCurrencyOrBlank(impMo)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', color: ivaEst > 0 ? '#2e7d32' : 'inherit' }}>{formatCurrencyOrBlank(ivaEst)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: sub > 0 ? '#2e7d32' : 'inherit' }}>{formatCurrencyOrBlank(sub)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', color: sfpVal > 0 ? '#b71c1c' : 'inherit' }}>{formatCurrencyOrBlank(sfpVal)}</TableCell>
                        <TableCell sx={{ textAlign: 'right', color: cuotaSindVal > 0 ? '#b71c1c' : 'inherit' }}>{formatCurrencyOrBlank(cuotaSindVal)}</TableCell>
                        
                        {/* COMP SIND (Union Compensation) editable cell */}
                        <TableCell sx={{ p: 0, minWidth: 100, borderRight: '1px solid #e2e8f0', bgcolor: compSindVal > 0 ? '#fff9c4' : 'transparent' }}>
                          <input
                            type="number"
                            value={compSindVal === 0 ? '' : compSindVal}
                            placeholder=""
                            disabled={isNewRow}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEstimaciones((prev) =>
                                prev.map((item) => (item.id === estId ? { ...item, compSind: val } : item))
                              );
                            }}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateEstimacionCompSind(estId, val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseFloat((e.target as HTMLInputElement).value) || 0;
                                updateEstimacionCompSind(estId, val);
                              }
                            }}
                            style={{
                              width: '100%',
                              height: '36px',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'center',
                              fontWeight: compSindVal > 0 ? 'bold' : 'normal',
                              outline: 'none',
                              color: compSindVal > 0 ? '#b71c1c' : 'inherit',
                              fontSize: '0.9rem',
                            }}
                          />
                        </TableCell>

                        {/* RETENER IVA Checkbox Cell */}
                        <TableCell sx={{ textAlign: 'center', p: 0, minWidth: 100, borderRight: '1px solid #e2e8f0', bgcolor: est.retenerIva ? '#ffe0b2' : 'transparent' }}>
                          <Checkbox
                            checked={!!est.retenerIva}
                            disabled={isNewRow}
                            size="small"
                            onChange={(e) => updateEstimacionRetenerIva(estId, e.target.checked)}
                          />
                        </TableCell>

                        {/* IVA RETENIDO Output cell */}
                        <TableCell sx={{ textAlign: 'right', color: ivaRetenidoVal > 0 ? '#b71c1c' : 'inherit' }}>{formatCurrencyOrBlank(ivaRetenidoVal)}</TableCell>

                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: totDeduc > 0 ? '#b71c1c' : 'inherit' }}>{formatCurrencyOrBlank(totDeduc)}</TableCell>
                        
                        {/* Sticky right column for LIQUIDO A PAGAR */}
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: liqPagar > 0 ? 'var(--verde-cfe)' : 'inherit', position: 'sticky', right: 0, zIndex: 11, backgroundColor: '#fff', borderLeft: '2px solid #e2e8f0', boxShadow: '-2px 0 4px rgba(0,0,0,0.05)' }}>
                          {formatCurrencyOrBlank(liqPagar)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </div>
  );
}
