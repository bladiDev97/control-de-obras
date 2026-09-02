import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  IconButton,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { contratosService } from '../services/contratos.service';
import { obrasService } from '../../obras/services/obras.service';
import { Contrato, Asignacion, Estimacion } from '../types/contrato.types';
import { api } from '../../../services/api';

interface FastCellInputProps {
  id: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  activeColor?: string;
  onNavigateKey: (key: string) => void;
}

const FastCellInput: React.FC<FastCellInputProps> = ({
  id,
  value,
  onChange,
  disabled = false,
  activeColor = '#005a3c',
  onNavigateKey,
}) => {
  const [localStr, setLocalStr] = useState<string>(value === 0 ? '' : String(value));

  useEffect(() => {
    setLocalStr(value === 0 ? '' : String(value));
  }, [value]);

  const handleBlur = () => {
    const parsed = parseFloat(localStr);
    const finalVal = isNaN(parsed) ? 0 : parsed;
    if (finalVal !== value) {
      onChange(finalVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        handleBlur();
        onNavigateKey(e.key);
      } else if (e.key === 'ArrowLeft' && (e.currentTarget.selectionStart === 0 || e.currentTarget.selectionStart === null)) {
        handleBlur();
        onNavigateKey(e.key);
      } else if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart === localStr.length || e.currentTarget.selectionStart === null)) {
        handleBlur();
        onNavigateKey(e.key);
      }
    }
  };

  const numVal = parseFloat(localStr) || 0;

  return (
    <input
      id={id}
      type="number"
      value={localStr}
      disabled={disabled}
      placeholder=""
      onChange={(e) => setLocalStr(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={(e) => e.target.select()}
      style={{
        width: '100%',
        height: '36px',
        border: 'none',
        background: 'transparent',
        textAlign: 'center',
        fontWeight: numVal > 0 ? 'bold' : 'normal',
        outline: 'none',
        color: numVal > 0 ? activeColor : 'inherit',
        fontSize: '0.9rem',
      }}
    />
  );
};

export default function ContratoDetailPage() {
  const { numeroContrato } = useParams<{ numeroContrato: string }>();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [estimaciones, setEstimaciones] = useState<Estimacion[]>([]);
  const [allObras, setAllObras] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Delete Block Dialog States
  const [deleteBlockOpen, setDeleteBlockOpen] = useState(false);
  const [selectedBlockToDelete, setSelectedBlockToDelete] = useState('');

  // Row-Level Editing States (Record locking per row)
  const [editingAsignRowId, setEditingAsignRowId] = useState<string | null>(null);
  const [editingEstimRowId, setEditingEstimRowId] = useState<string | null>(null);
  const [savingRow, setSavingRow] = useState<boolean>(false);

  // Table Scroll Container Refs
  const tableAsignRef = React.useRef<HTMLDivElement>(null);
  const tableEstimRef = React.useRef<HTMLDivElement>(null);

  const scrollTable = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const amount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const loadData = async () => {
    if (!numeroContrato) return;
    setLoading(true);
    try {
      const [cData, aData, eData, oData] = await Promise.all([
        contratosService.getOne(numeroContrato),
        contratosService.getAsignaciones(numeroContrato),
        contratosService.getEstimaciones(numeroContrato),
        obrasService.getAll(),
      ]);
      
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
  const totalAmpliado = totalContratado * (1 + (contrato.porcentajeAmpliacion ?? 0) / 100);

  const totalAsignado = contrato.conceptos.reduce((acc, curr) => {
    const qty = getConceptSumAsignada(curr.codigo);
    return acc + (qty * curr.costoUnitario);
  }, 0);

  const calculatePlazoDias = () => {
    if (contrato?.plazoDias && contrato.plazoDias > 0) {
      return contrato.plazoDias;
    }
    if (contrato?.fechaInicio && contrato?.fechaFin) {
      const start = new Date(contrato.fechaInicio + 'T00:00:00');
      const end = new Date(contrato.fechaFin + 'T00:00:00');
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
      }
    }
    return 0;
  };

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

  const getAsignacionTotalVal = (asign: Asignacion) => {
    return contrato.conceptos.reduce((acc, curr) => {
      const qty = asign.conceptos[curr.codigo] || 0;
      return acc + (qty * curr.costoUnitario);
    }, 0);
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

  // --- Local State Cell Editing Handlers (Draft Mode) ---
  const updateAsignacionQuantity = (atCode: string, conceptCode: string, value: number) => {
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
      }
      return prev;
    });
  };

  const handleSaveAsignRow = async (asign: Asignacion) => {
    if (!contrato) return;
    setSavingRow(true);
    const matchedObra = allObras.find((o) => {
      const k = o.at && o.at.trim() !== '' ? o.at.trim() : o.solicitudPo;
      return k === asign.at;
    });

    const payload = {
      tipoObra: matchedObra?.tipoObra || asign.tipoObra || 'N/A',
      obra: matchedObra?.obra || asign.obra || 'N/A',
      orden: matchedObra?.orden || asign.orden || 'N/A',
      activo: matchedObra?.activo || asign.activo || 'N/A',
      conceptos: asign.conceptos || {},
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/asignaciones/${asign.at}`, payload);
      setEditingAsignRowId(null);
    } catch (err) {
      console.error('Error al guardar asignación en base de datos:', err);
      alert('Ocurrió un error al guardar los datos de la asignación.');
    } finally {
      setSavingRow(false);
    }
  };

  const updateEstimacionQuantity = (idKey: string, conceptCode: string, value: number) => {
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
  };

  const updateEstimacionCompSind = (idKey: string, value: number) => {
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
  };

  const updateEstimacionRetenerIva = (idKey: string, value: boolean) => {
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
  };

  const updateEstimacionAt = (idKey: string, newAt: string) => {
    setEstimaciones((prev) => {
      const cleanAt = newAt.trim().toUpperCase();
      const matchedAsign = displayAsignaciones.find((a) => a.at.trim().toUpperCase() === cleanAt);
      const idx = prev.findIndex((e) => e.id === idKey || `${e.at}#${e.numeroEstimacion}` === idKey);
      if (idx > -1) {
        const updated = [...prev];
        let conceptsCopy = { ...updated[idx].conceptos };
        if (matchedAsign && Object.keys(conceptsCopy).length === 0) {
          conceptsCopy = { ...matchedAsign.conceptos };
        }
        updated[idx] = {
          ...updated[idx],
          at: newAt,
          obra: matchedAsign?.obra || updated[idx].obra || '',
          tipoObra: matchedAsign?.tipoObra || updated[idx].tipoObra || '',
          orden: matchedAsign?.orden || updated[idx].orden || '',
          activo: matchedAsign?.activo || updated[idx].activo || '',
          conceptos: conceptsCopy,
        };
        return updated;
      }
      return prev;
    });
  };

  const updateEstimacionField = (idKey: string, field: string, value: string) => {
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
  };

  const handleSaveEstimRow = async (est: Estimacion) => {
    if (!contrato) return;
    const cleanAt = est.at ? est.at.trim() : '';
    if (!cleanAt) {
      alert('Por favor selecciona o ingresa la AT para esta estimación.');
      return;
    }

    const numEst = est.numeroEstimacion && est.numeroEstimacion.trim() !== '' ? est.numeroEstimacion.trim() : '1';

    setSavingRow(true);
    const matchedAsign = displayAsignaciones.find((a) => a.at.trim().toUpperCase() === cleanAt.toUpperCase());

    const payload = {
      numeroEstimacion: numEst,
      at: cleanAt,
      obra: matchedAsign?.obra || est.obra || 'N/A',
      avanceMvmo: est.avanceMvmo || '',
      bitacoraSupervision: est.bitacoraSupervision || '',
      bitacoraAutorizacion: est.bitacoraAutorizacion || '',
      compSind: est.compSind || 0,
      retenerIva: est.retenerIva || false,
      conceptos: est.conceptos || {},
    };

    try {
      await api.post(`/contratos/${contrato.numeroContrato}/estimaciones/${encodeURIComponent(cleanAt)}/${encodeURIComponent(numEst)}`, payload);
      setEditingEstimRowId(null);
      await loadData();
    } catch (err) {
      console.error('Error al guardar estimación en base de datos:', err);
      alert('Ocurrió un error al guardar la estimación en la base de datos.');
    } finally {
      setSavingRow(false);
    }
  };

  // --- Inline Adding Row for Estimations ---
  const handleAddBlankEstimRow = () => {
    const existingNums = estimaciones
      .map((e) => parseInt(e.numeroEstimacion, 10))
      .filter((n) => !isNaN(n) && n > 0);
    const nextNum = existingNums.length > 0 ? String(Math.max(...existingNums) + 1) : '1';

    const tempId = `temp#${Date.now()}`;
    const tempRow: Estimacion = {
      id: tempId,
      numeroContrato: contrato ? contrato.numeroContrato : '',
      at: '',
      obra: '',
      numeroEstimacion: nextNum,
      bitacoraSupervision: '',
      bitacoraAutorizacion: '',
      avanceMvmo: '',
      compSind: 0,
      retenerIva: false,
      conceptos: {},
    };
    setEstimaciones((prev) => [...prev, tempRow]);
    setEditingEstimRowId(tempId); // Unlock new row automatically!
  };

  const handleSelectAtForEstimRow = async (tempId: string, atCode: string) => {
    if (!contrato) return;
    const cleanAt = atCode.trim();
    if (!cleanAt) return;

    const matchedAsign = displayAsignaciones.find((a) => a.at.trim().toUpperCase() === cleanAt.toUpperCase());
    const tempRow = estimaciones.find((e) => (e.id || `${e.at}#${e.numeroEstimacion}`) === tempId);
    
    const rowNum = tempRow?.numeroEstimacion && tempRow.numeroEstimacion !== '' 
      ? tempRow.numeroEstimacion 
      : String(estimaciones.filter(e => Boolean(e.numeroEstimacion)).length + 1);
    
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
      await api.post(`/contratos/${contrato.numeroContrato}/estimaciones/${cleanAt}/${rowNum}`, payload);
      loadData();
    } catch (err) {
      console.error('Error al agregar fila de estimación:', err);
    }
  };

  // --- Keyboard Navigation Helpers ---
  const focusCellInput = (tableId: string, r: number, c: number) => {
    const el = document.getElementById(`${tableId}-cell-${r}-${c}`);
    if (el) {
      el.focus();
      (el as HTMLInputElement).select();
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const handleCellNavigate = (tableId: string, r: number, c: number, key: string, maxR: number, maxC: number) => {
    let targetR = r;
    let targetC = c;
    if (key === 'ArrowLeft') targetC = Math.max(0, c - 1);
    if (key === 'ArrowRight') targetC = Math.min(maxC - 1, c + 1);
    if (key === 'ArrowUp') targetR = Math.max(0, r - 1);
    if (key === 'ArrowDown' || key === 'Enter') targetR = Math.min(maxR - 1, r + 1);

    focusCellInput(tableId, targetR, targetC);
  };

  // --- Delete Single Row in Estimaciones ---
  const handleDeleteEstimRow = async (est: Estimacion) => {
    if (!contrato) return;
    const estId = est.id || `${est.at}#${est.numeroEstimacion}`;
    const isNewRow = estId.startsWith('temp#');
    
    if (window.confirm(`¿Estás seguro de eliminar la fila de la Estimación N° ${est.numeroEstimacion || 'nueva'} para el AT ${est.at || 'N/A'}?`)) {
      if (!isNewRow && est.at && est.numeroEstimacion) {
        try {
          await contratosService.deleteEstimacion(contrato.numeroContrato, est.at, est.numeroEstimacion);
        } catch (err) {
          console.error('Error al eliminar estimación:', err);
        }
      }
      setEstimaciones((prev) => prev.filter((item) => (item.id || `${item.at}#${item.numeroEstimacion}`) !== estId));
    }
  };

  // --- Delete Block in Estimaciones ---
  const handleDeleteBlockConfirm = async () => {
    if (!contrato || !selectedBlockToDelete) return;
    if (window.confirm(`¿Estás seguro de eliminar TODO EL BLOQUE de la Estimación N° ${selectedBlockToDelete}? Esta acción no se puede deshacer.`)) {
      try {
        await contratosService.deleteEstimacionBlock(contrato.numeroContrato, selectedBlockToDelete);
      } catch (err) {
        console.error('Error al eliminar bloque de estimación:', err);
      }
      setEstimaciones((prev) => prev.filter((item) => String(item.numeroEstimacion) !== String(selectedBlockToDelete)));
      setDeleteBlockOpen(false);
      setSelectedBlockToDelete('');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
              <Typography variant="body1" sx={{ fontWeight: '800', color: 'var(--color-text-dark)' }}>{calculatePlazoDias()} Días Naturales</Typography>
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
        <Grid item xs={12} sm={6} md={3}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', borderLeft: '6px solid #2563eb', borderRadius: '18px', padding: '20px', height: '100%' }}>
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

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #fffbe6 0%, #ffffff 100%)', borderLeft: '6px solid #d97706', borderRadius: '18px', padding: '20px', height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#b45309', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>MONTO TOTAL ASIGNADO (EN OBRAS)</Typography>
                <span style={{ fontSize: '1.25rem' }}>📋</span>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#92400e', mb: 1 }}>{formatCurrency(totalAsignado)}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: '500' }}>Monto total asignado en la hoja de obras</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderLeft: '6px solid #16a34a', borderRadius: '18px', padding: '20px', height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' }}>MONTO EJECUTADO / ESTIMADO</Typography>
                <span style={{ fontSize: '1.25rem' }}>🛠️</span>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#14532d', mb: 1 }}>{formatCurrency(totalEjecutado)}</Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: '600', display: 'block', lineHeight: '1.2' }}>
                Suma total a Precios Unitarios (P.U.)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card" sx={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)', borderLeft: '6px solid var(--verde-cfe)', borderRadius: '18px', padding: '20px', height: '100%' }}>
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
        <Box sx={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>
              Hoja de Asignación de Conceptos por Obra (Edición y Guardado por Registro)
            </Typography>

            <Typography variant="body2" sx={{ color: 'var(--color-text-light)' }}>
              Total de obras: <strong>{displayAsignaciones.length}</strong>
            </Typography>
          </Box>

          <TableContainer ref={tableAsignRef} component={Paper} sx={{ width: '100%', maxWidth: '100%', maxHeight: 'calc(100vh - 270px)', flexGrow: 1, mb: 2, borderRadius: '12px', overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Sticky headers on left side: AT, OBRA */}
                  <TableCell sx={{ minWidth: 90, position: 'sticky', left: 0, zIndex: 15, backgroundColor: '#fff', fontWeight: 'bold' }}>AT</TableCell>
                  <TableCell sx={{ minWidth: 90, position: 'sticky', left: 90, zIndex: 15, backgroundColor: '#fff', fontWeight: 'bold', borderRight: '2px solid #cbd5e1' }}>OBRA</TableCell>
                  <TableCell sx={{ minWidth: 70, fontWeight: 'bold' }}>TIPO</TableCell>
                  <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>ORDEN</TableCell>
                  <TableCell sx={{ minWidth: 90, fontWeight: 'bold' }}>ACTIVO</TableCell>
                  
                  {/* Concept code columns */}
                  {contrato.conceptos.map((concept) => (
                    <TableCell
                      key={concept.codigo}
                      sx={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        minWidth: 125,
                        lineHeight: 1.2
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{concept.codigo}</div>
                      <div style={{ fontSize: '0.7rem', color: '#1565c0', marginTop: '2px', fontWeight: 'bold' }}>
                        P.U.: {formatCurrency(concept.costoUnitario)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>
                        M.O.: {formatCurrency(concept.manoDeObra)}
                      </div>
                    </TableCell>
                  ))}

                  {/* Sticky right column for TOTAL IMPORTE */}
                  <TableCell sx={{ minWidth: 140, position: 'sticky', right: 130, zIndex: 15, textAlign: 'right', backgroundColor: '#fff', borderLeft: '2px solid #005a3c', fontWeight: 'bold', color: 'var(--verde-cfe) !important' }}>
                    TOTAL IMPORTE (P.U.)
                  </TableCell>
                  {/* Sticky right column for ACCIONES */}
                  <TableCell sx={{ minWidth: 130, position: 'sticky', right: 0, zIndex: 15, textAlign: 'center', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b !important' }}>
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayAsignaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7 + contrato.conceptos.length} sx={{ textAlign: 'center', py: 4 }}>
                      No hay asignaciones cargadas para este contrato.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayAsignaciones.map((asign, rIdx) => {
                    const isEditing = editingAsignRowId === asign.at;

                    return (
                      <TableRow key={asign.id} hover sx={{ backgroundColor: isEditing ? '#fefce8' : 'transparent' }}>
                        {/* Sticky cells on body */}
                        <TableCell sx={{ fontWeight: 'bold', color: 'var(--color-primary)', position: 'sticky', left: 0, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff' }}>{asign.at}</TableCell>
                        <TableCell sx={{ position: 'sticky', left: 90, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', borderRight: '2px solid #cbd5e1' }}>{asign.obra || '-'}</TableCell>
                        <TableCell>{asign.tipoObra || '-'}</TableCell>
                        <TableCell>{asign.orden || '-'}</TableCell>
                        <TableCell>{asign.activo || '-'}</TableCell>
                        
                        {/* Concept editable cells */}
                        {contrato.conceptos.map((concept, cIdx) => {
                          const qty = asign.conceptos[concept.codigo] || 0;
                          return (
                            <TableCell
                              key={concept.codigo}
                              sx={{
                                p: 0,
                                textAlign: 'center',
                                bgcolor: qty > 0 ? (isEditing ? '#a7f3d0' : '#d1fae5') : 'transparent',
                                minWidth: 80,
                                borderRight: '1px solid #e2e8f0',
                              }}
                            >
                              <FastCellInput
                                id={`asign-cell-${rIdx}-${cIdx}`}
                                value={qty}
                                disabled={!isEditing}
                                activeColor="#005a3c"
                                onChange={(newVal) => updateAsignacionQuantity(asign.at, concept.codigo, newVal)}
                                onNavigateKey={(key) => handleCellNavigate('asign', rIdx, cIdx, key, displayAsignaciones.length, contrato.conceptos.length)}
                              />
                            </TableCell>
                          );
                        })}

                        {/* Sticky total value on right */}
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: '#005a3c', position: 'sticky', right: 130, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', borderLeft: '2px solid #005a3c', boxShadow: '-3px 0 6px rgba(0,0,0,0.06)' }}>
                          {formatCurrencyOrBlank(getAsignacionTotalVal(asign))}
                        </TableCell>

                        {/* Sticky action cell */}
                        <TableCell sx={{ textAlign: 'center', position: 'sticky', right: 0, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', borderLeft: '1px solid #e2e8f0', minWidth: 70 }}>
                          {isEditing ? (
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                              <IconButton
                                size="small"
                                color="success"
                                disabled={savingRow}
                                onClick={() => handleSaveAsignRow(asign)}
                                title="Guardar cambios"
                                sx={{ p: 0.5, bgcolor: '#dcfce7', '&:hover': { bgcolor: '#bbf7d0' } }}
                              >
                                <SaveIcon sx={{ fontSize: 16, color: '#15803d' }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => setEditingAsignRowId(null)}
                                title="Cancelar edición"
                                sx={{ p: 0.5 }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => setEditingAsignRowId(asign.at)}
                              title="Editar fila"
                              sx={{ p: 0.5 }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
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

      {/* Tab 2: Estimaciones Sheet */}
      {tabIndex === 2 && (
        <Box sx={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                Registro de Estimaciones (Edición y Guardado por Registro)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddBlankEstimRow}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
              >
                + Agregar Fila
              </Button>
            </Box>

            <Typography variant="body2" sx={{ color: 'var(--color-text-light)' }}>
              Estimaciones: <strong>{estimaciones.length}</strong>
            </Typography>
          </Box>

          <TableContainer ref={tableEstimRef} component={Paper} sx={{ width: '100%', maxWidth: '100%', maxHeight: 'calc(100vh - 270px)', flexGrow: 1, mb: 2, borderRadius: '12px', overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Sticky headers for Tab 2 - Left side: ONLY N° EST, AT, OBRA */}
                  <TableCell sx={{ minWidth: 65, position: 'sticky', left: 0, zIndex: 15, backgroundColor: '#fff', fontWeight: 'bold' }}>N° EST</TableCell>
                  <TableCell sx={{ minWidth: 90, position: 'sticky', left: 65, zIndex: 15, backgroundColor: '#fff', fontWeight: 'bold' }}>AT</TableCell>
                  <TableCell sx={{ minWidth: 90, position: 'sticky', left: 155, zIndex: 15, backgroundColor: '#fff', fontWeight: 'bold', borderRight: '2px solid #cbd5e1' }}>OBRA</TableCell>
                  <TableCell sx={{ minWidth: 70, fontWeight: 'bold' }}>TIPO</TableCell>
                  <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>ORDEN</TableCell>
                  <TableCell sx={{ minWidth: 90, fontWeight: 'bold' }}>ACTIVO</TableCell>

                  {/* Concept code columns */}
                  {contrato.conceptos.map((concept) => (
                    <TableCell
                      key={concept.codigo}
                      sx={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        minWidth: 125,
                        lineHeight: 1.2
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{concept.codigo}</div>
                      <div style={{ fontSize: '0.7rem', color: '#1565c0', marginTop: '2px', fontWeight: 'bold' }}>
                        P.U.: {formatCurrency(concept.costoUnitario)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>
                        M.O.: {formatCurrency(concept.manoDeObra)}
                      </div>
                    </TableCell>
                  ))}

                  {/* Financial calculation headers */}
                  <TableCell sx={{ minWidth: 130, textAlign: 'right', borderLeft: '2px solid #cbd5e1', fontWeight: 'bold', position: 'sticky', right: 260, zIndex: 15, backgroundColor: '#fff', color: '#0f172a !important' }}>IMPORTE TOTAL</TableCell>
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
                  <TableCell sx={{ minWidth: 130, textAlign: 'right', borderLeft: '2px solid #005a3c', fontWeight: 'bold', position: 'sticky', right: 130, zIndex: 15, backgroundColor: '#fff', color: 'var(--verde-cfe) !important' }}>LIQUIDO A PAGAR</TableCell>
                  <TableCell sx={{ minWidth: 130, position: 'sticky', right: 0, zIndex: 15, textAlign: 'center', backgroundColor: '#fff', fontWeight: 'bold', color: '#1e293b !important' }}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7 + contrato.conceptos.length + 13} sx={{ textAlign: 'center', py: 4 }}>
                      Haz clic en "Agregar Fila" para empezar a registrar estimaciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...estimaciones]
                    .sort((a, b) => (parseInt(a.numeroEstimacion, 10) || 0) - (parseInt(b.numeroEstimacion, 10) || 0))
                    .map((est, rIdx) => {
                      const estId = est.id || `${est.at}#${est.numeroEstimacion}`;
                      const isNewRow = estId.startsWith('temp#');
                      const isEditing = editingEstimRowId === estId;

                      // Look up matching assignment dynamically to fill Tipo, Orden, Activo if saved
                      const cleanAt = est.at ? est.at.trim().toUpperCase() : '';
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
                        <TableRow key={estId} hover sx={{ backgroundColor: isEditing ? '#fefce8' : 'transparent' }}>
                          {/* Sticky body cells for Tab 2: ONLY N° EST, AT, OBRA */}
                          <TableCell sx={{ p: 0.5, fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', textAlign: 'center', color: '#1565c0' }}>
                            {est.numeroEstimacion || '-'}
                          </TableCell>
                          
                          {/* AT cell with Text Input Field */}
                          <TableCell sx={{ p: 0.5, position: 'sticky', left: 65, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', textAlign: 'center' }}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={est.at || ''}
                                placeholder="Escribe AT..."
                                onChange={(e) => updateEstimacionAt(estId, e.target.value)}
                                style={{
                                  width: '75px',
                                  height: '30px',
                                  border: '1px solid #16a34a',
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  outline: 'none',
                                  background: '#ffffff',
                                  color: 'inherit',
                                  fontSize: '0.85rem',
                                }}
                              />
                            ) : (
                              <Box sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                {est.at || '-'}
                              </Box>
                            )}
                          </TableCell>

                          {/* Obra cell (Auto-populated from Asignación) */}
                          <TableCell sx={{ position: 'sticky', left: 155, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', borderRight: '2px solid #cbd5e1', fontWeight: 'bold' }}>
                            {matchedAsign?.obra || est.obra || '-'}
                          </TableCell>

                          {/* Tipo cell (Auto-populated from Asignación) */}
                          <TableCell sx={{ backgroundColor: isEditing ? '#fefce8' : '#fff' }}>
                            {matchedAsign?.tipoObra || est.tipoObra || '-'}
                          </TableCell>

                          {/* Orden cell (Auto-populated from Asignación) */}
                          <TableCell sx={{ backgroundColor: isEditing ? '#fefce8' : '#fff' }}>
                            {matchedAsign?.orden || est.orden || '-'}
                          </TableCell>

                          {/* Activo cell (Auto-populated from Asignación) */}
                          <TableCell sx={{ backgroundColor: isEditing ? '#fefce8' : '#fff' }}>
                            {matchedAsign?.activo || est.activo || '-'}
                          </TableCell>

                          {/* Concept editable cells with FastCellInput */}
                          {contrato.conceptos.map((concept, cIdx) => {
                            const qty = est.conceptos[concept.codigo] || 0;
                            return (
                              <TableCell
                                key={concept.codigo}
                                sx={{
                                  p: 0,
                                  textAlign: 'center',
                                  bgcolor: qty > 0 ? (isEditing ? '#a7f3d0' : '#d1fae5') : 'transparent',
                                  minWidth: 80,
                                  borderRight: '1px solid #e2e8f0',
                                }}
                              >
                                <FastCellInput
                                  id={`estim-cell-${rIdx}-${cIdx}`}
                                  value={qty}
                                  disabled={true}
                                  activeColor="#005a3c"
                                  onChange={(newVal) => updateEstimacionQuantity(estId, concept.codigo, newVal)}
                                  onNavigateKey={(key) => handleCellNavigate('estim', rIdx, cIdx, key, estimaciones.length, contrato.conceptos.length)}
                                />
                              </TableCell>
                            );
                          })}

                          {/* Sticky IMPORTE TOTAL cell */}
                          <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: impTotal > 0 ? '#1565c0' : 'inherit', borderLeft: '2px solid #cbd5e1', position: 'sticky', right: 260, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', boxShadow: '-3px 0 6px rgba(0,0,0,0.06)' }}>
                            {formatCurrencyOrBlank(impTotal)}
                          </TableCell>

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
                              disabled={!isEditing}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                updateEstimacionCompSind(estId, val);
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
                              disabled={!isEditing}
                              size="small"
                              onChange={(e) => updateEstimacionRetenerIva(estId, e.target.checked)}
                            />
                          </TableCell>

                          {/* IVA RETENIDO Output cell */}
                          <TableCell sx={{ textAlign: 'right', color: ivaRetenidoVal > 0 ? '#b71c1c' : 'inherit' }}>{formatCurrencyOrBlank(ivaRetenidoVal)}</TableCell>

                          <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: totDeduc > 0 ? '#b71c1c' : 'inherit' }}>{formatCurrencyOrBlank(totDeduc)}</TableCell>
                          
                          {/* Sticky LIQUIDO A PAGAR cell */}
                          <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: liqPagar > 0 ? 'var(--verde-cfe)' : 'inherit', position: 'sticky', right: 130, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', borderLeft: '2px solid #005a3c', boxShadow: '-3px 0 6px rgba(0,0,0,0.06)' }}>
                            {formatCurrencyOrBlank(liqPagar)}
                          </TableCell>

                          {/* Sticky Action Cell: Edit / Save / Delete / Cancel */}
                          <TableCell sx={{ textAlign: 'center', position: 'sticky', right: 0, zIndex: 11, backgroundColor: isEditing ? '#fefce8' : '#fff', borderLeft: '1px solid #e2e8f0', minWidth: 90 }}>
                            {isEditing ? (
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={savingRow}
                                  onClick={() => handleSaveEstimRow(est)}
                                  title="Guardar cambios"
                                  sx={{ p: 0.5, bgcolor: '#dcfce7', '&:hover': { bgcolor: '#bbf7d0' } }}
                                >
                                  <SaveIcon sx={{ fontSize: 16, color: '#15803d' }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteEstimRow(est)}
                                  title="Eliminar fila"
                                  sx={{ p: 0.5 }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingEstimRowId(null)}
                                  title="Cancelar edición"
                                  sx={{ p: 0.5 }}
                                >
                                  <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            ) : (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => setEditingEstimRowId(estId)}
                                title="Editar fila"
                                sx={{ p: 0.5 }}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            )}
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

      {/* Dialog for deleting an entire estimation block */}
      <Dialog open={deleteBlockOpen} onClose={() => setDeleteBlockOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Eliminar Bloque de Estimación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Selecciona la estimación completa que deseas eliminar del contrato. Todas las filas asignadas a esta estimación serán borradas.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Número de Estimación</InputLabel>
            <Select
              value={selectedBlockToDelete}
              label="Número de Estimación"
              onChange={(e) => setSelectedBlockToDelete(e.target.value)}
            >
              {Array.from(new Set(estimaciones.map((e) => e.numeroEstimacion).filter(Boolean))).map((numEst) => {
                const count = estimaciones.filter((e) => e.numeroEstimacion === numEst).length;
                return (
                  <MenuItem key={numEst} value={numEst}>
                    Estimación N° {numEst} ({count} {count === 1 ? 'obra' : 'obras'})
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteBlockOpen(false)} sx={{ borderRadius: '8px', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!selectedBlockToDelete}
            onClick={handleDeleteBlockConfirm}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
          >
            Eliminar Bloque Completo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
