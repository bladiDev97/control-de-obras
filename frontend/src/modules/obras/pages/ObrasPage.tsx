import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, MenuItem, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaymentsIcon from '@mui/icons-material/Payments';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import { useObras } from '../hooks/useObras';
import { obrasService, areasService } from '../services/obras.service';
import { contratosService } from '../../contratos/services/contratos.service';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import ReusableModal from '../../../components/Modal/ReusableModal';
import { AppleLoadingOverlay } from '../../../components/Modal/AppleLoadingOverlay';
import UploadPdf from '../../../components/UploadPdf/UploadPdf';
import { Obra } from '../types/obra.types';

// Declare global augmentation for the geo map window reference
declare global { interface Window { __geoMapWindow?: Window | null } }

const formatDateForInput = (val?: string): string => {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{4}[\.\/-]\d{2}[\.\/-]\d{2}/.test(s)) {
    return s.slice(0, 10).replace(/[\.\/]/g, '-');
  }
  if (s.includes('T')) {
    return s.split('T')[0];
  }
  return s;
};

const getPlanoUrl = (url?: string) => {
  if (!url) return '#';
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return `${apiBase}/obras/plano-view?url=${encodeURIComponent(url)}`;
};

export default function ObrasPage() {
  const { obras, loading, refetch } = useObras();
  const [selected, setSelected] = useState<Obra | null>(null);
  const [previewObra, setPreviewObra] = useState<Obra | null>(null);
  const [terminarForm, setTerminarForm] = useState<{
    fechaTerminoCampo: string;
    fechaFinConstruccion: string;
  }>({
    fechaTerminoCampo: '',
    fechaFinConstruccion: '',
  });

  // Contracts list state
  const [contratos, setContratos] = useState<any[]>([]);

  // Apple loading HUD state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTitle, setProcessingTitle] = useState('Asignando obra...');
  const [processingSubtitle, setProcessingSubtitle] = useState('Procesando información, por favor espere');

  // States for Assign action
  const [assigning, setAssigning] = useState<Obra | null>(null);
  const [assignForm, setAssignForm] = useState({
    at: '',
    tipoObra: '',
    orden: '',
    activo: '',
    obra: '',
    nombreSolicitante: '',
    poblacion: '',
    municipio: '',
    fechaProgramada: '',
    fechaPago: '',
    fechaAsignacion: new Date().toISOString().slice(0, 10),
    contrato: '',
    contratista: '',
    fechaAut: '',
    fechaSupervision: '',
    tieneRetiro: false,
    atRetiro: '',
    ordenRetiro: '',
    siadRetiro: '',
    coordenadaX: '',
    coordenadaY: '',
    area: '',
    diasObraAPORTACIONES: '',
  });
  const [planoPdf, setPlanoPdf] = useState<File | null>(null);

  // States for Edit action
  const [editing, setEditing] = useState<Obra | null>(null);
  const [editForm, setEditForm] = useState({
    solicitudPo: '',
    at: '',
    obra: '',
    anio: '',
    tipoObra: '',
    activo: '',
    orden: '',
    poblacion: '',
    municipio: '',
    nombreSolicitante: '',
    coordenadaX: '',
    coordenadaY: '',
    contrato: '',
    contratista: '',
    tieneRetiro: false,
    atRetiro: '',
    siadRetiro: '',
    ordenRetiro: '',
    fechaPago: '',
    fechaProgramada: '',
    fechaAut: '',
    fechaSupervision: '',
    fechaAsignacion: '',
    fechaFinConstruccion: '',
    fechaTerminoCampo: '',
    fechaCapitalizacion: '',
    estatus: '',
    area: '',
    diasObraAPORTACIONES: '',
  });

  // Areas state
  const [areas, setAreas] = useState<any[]>([]);
  const [addingArea, setAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [contratosList, areasList] = await Promise.all([
          contratosService.getAll(),
          areasService.getAll(),
        ]);
        setContratos(contratosList);
        setAreas(areasList);
      } catch (err) {
        console.error('Error cargando metadatos en la vista de obras:', err);
      }
    };
    loadMetadata();
  }, []);

  const handleContratoChange = (numeroContrato: string) => {
    const selected = contratos.find((c) => c.numeroContrato === numeroContrato);
    setAssignForm({
      ...assignForm,
      contrato: numeroContrato,
      contratista: selected ? (selected.contratista || '') : '',
    });
  };
  const columns: Column<Obra>[] = [
    {
      key: 'solicitudPo',
      label: 'Solicitud/PO',
      width: '10%',
      render: (row) => (
        <span
          onClick={() => setPreviewObra(row)}
          title={row.solicitudPo}
          style={{
            color: '#1d4ed8',
            textDecoration: 'underline',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '0.74rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block'
          }}
        >
          {row.solicitudPo}
        </span>
      )
    },
    { key: 'at', label: 'AT', width: '5%' },
    { key: 'obra', label: 'Obra', width: '5%' },
    { key: 'anio', label: 'Año', width: '4%' },
    {
      key: 'tipoObra',
      label: 'Tipo Obra',
      width: '9%',
      render: (row: any) => {
        const tipo = (row.tipoObra || '').toUpperCase();
        if (tipo === 'SSEEBRA' || tipo === 'APORTACIONES') {
          const dias = row.diasObraAPORTACIONES === 28 ? 28 : 9;
          const is9 = dias === 9;
          const bg = is9 ? '#fee2e2' : '#dbeafe';
          const fg = is9 ? '#dc2626' : '#1d4ed8';
          const border = is9 ? '1px solid #fca5a5' : '1px solid #93c5fd';

          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span>{tipo}</span>
              <span
                style={{
                  backgroundColor: bg,
                  color: fg,
                  border: border,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.66rem',
                  lineHeight: '1.2',
                }}
              >
                {dias}D
              </span>
            </div>
          );
        }
        return tipo || '-';
      },
    },
    { key: 'activo', label: 'Activo', width: '6%' },
    { key: 'orden', label: 'Orden', width: '8%' },
    {
      key: 'rd',
      label: 'RD',
      width: '26%',
      render: (row) => {
        const cleanPoblacion = ((row as any).poblacion || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
        const cleanRd = (row.rd || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
        const poblacion = cleanPoblacion || cleanRd;
        const nombre = ((row as any).nombreSolicitante || '').trim();
        const parts = [poblacion, nombre].filter(Boolean).join(' ');
        let text = (parts || cleanRd || row.rd || '').toUpperCase();
        return (
          <div
            title={text}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.72rem',
              lineHeight: '1.2'
            }}
          >
            {text || '-'}
          </div>
        );
      }
    },
    {
      key: 'estatus',
      label: 'Estatus',
      width: '9%',
      render: (row) => {
        let bg = '#fef3c7'; // soft yellow for PENDIENTE (ASIGNAR)
        let fg = '#d97706';
        let border = '1px solid #f59e0b';
        let displayLabel = 'ASIGNAR';

        if (row.estatus === 'ASIGNADA') {
          bg = '#c5e3db'; // soft CFE panel (PROCESO)
          fg = '#008E60';
          border = '1px solid #008E60';
          displayLabel = 'PROCESO';
        } else if (row.estatus === 'TERMINADA') {
          bg = '#e6f4ea'; // light green (TERMINADA)
          fg = '#008E60';
          border = '1px solid #8ce2a1';
          displayLabel = 'TERMINADA';
        } else if (row.estatus === 'CAPITALIZADA') {
          bg = '#008E60'; // solid CFE green (CAPITALIZADA)
          fg = '#ffffff';
          border = '1px solid #007650';
          displayLabel = 'CAPITALIZADA';
        }

        const handleEstatusClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (row.estatus === 'PENDIENTE') {
            setAssigning(row);
            setAssignForm({
              at: row.at || '',
              tipoObra: row.tipoObra || '',
              orden: row.orden || '',
              activo: row.activo || '',
              obra: row.obra || '',
              nombreSolicitante: row.nombreSolicitante || '',
              poblacion: (row as any).poblacion || '',
              municipio: (row as any).municipio || '',
              fechaProgramada: (row as any).fechaProgramada || '',
              fechaPago: (row as any).fechaPago || '',
              fechaAsignacion: new Date().toISOString().slice(0, 10),
              contrato: row.contrato || '',
              contratista: (row as any).contratista || '',
              fechaAut: (row as any).fechaAut || '',
              fechaSupervision: (row as any).fechaSupervision || '',
              tieneRetiro: !!(row as any).ordenRetiro || !!(row as any).atRetiro,
              atRetiro: (row as any).atRetiro || '',
              ordenRetiro: (row as any).ordenRetiro || '',
              siadRetiro: (row as any).siadRetiro || '',
              coordenadaX: (row as any).coordenadaX || '',
              coordenadaY: (row as any).coordenadaY || '',
              area: (row as any).area || '',
              diasObraAPORTACIONES: (row as any).diasObraAPORTACIONES || '',
            });
            setPlanoPdf(null);
          } else if (row.estatus === 'ASIGNADA') {
            setSelected(row);
            setTerminarForm({
              fechaTerminoCampo: formatDateForInput(row.fechaTerminoCampo || ''),
              fechaFinConstruccion: formatDateForInput((row as any).fechaFinConstruccion || (row as any).fechaTermino || ''),
            });
          }
        };

        const isInteractive = row.estatus === 'PENDIENTE' || row.estatus === 'ASIGNADA';

        return (
          <span
            onClick={handleEstatusClick}
            style={{
              padding: '3px 7px',
              borderRadius: '12px',
              backgroundColor: bg,
              color: fg,
              border: border,
              fontWeight: '800',
              fontSize: '0.64rem',
              letterSpacing: '0.2px',
              textTransform: 'uppercase',
              display: 'inline-block',
              cursor: isInteractive ? 'pointer' : 'default',
              whiteSpace: 'nowrap'
            }}
          >
            {displayLabel}
          </span>
        );
      },
    },

    {
      key: 'diasParaVencerse' as any,
      label: 'POR VENCER',
      width: '10%',
      render: (row: any) => {
        // Para obras ya concluidas (capitalizadas o terminadas en campo), poner guión
        if (row.estatus === 'CAPITALIZADA' || row.estatus === 'TERMINADA') {
          return <span style={{ color: '#9ca3af', fontWeight: 600 }}>-</span>;
        }

        const days = typeof row.diasParaVencerse === 'number' ? row.diasParaVencerse : 0;
        let bg = '#dcfce7'; // Verde (11+ días)
        let fg = '#15803d';
        let border = '1px solid #86efac';

        if (days <= 3) {
          bg = '#fee2e2'; // Rojo (<= 3 días o vencidos)
          fg = '#dc2626';
          border = '1px solid #fca5a5';
        } else if (days >= 4 && days <= 10) {
          bg = '#fef3c7'; // Amarillo (4 a 10 días)
          fg = '#d97706';
          border = '1px solid #fde68a';
        }

        return (
          <span
            style={{
              backgroundColor: bg,
              color: fg,
              border: border,
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.72rem',
              display: 'inline-block',
              whiteSpace: 'nowrap'
            }}
          >
            {days} {Math.abs(days) === 1 ? 'día' : 'días'}
          </span>
        );
      },
    },
    {
      key: 'dias' as any,
      label: 'DÍAS',
      width: '7%',
      render: (row: any) => typeof row.dias === 'number' ? row.dias : 0,
    },
    {
      key: 'coordenadas' as any,
      label: 'GEOS',
      width: '9%',
      render: (row) => {
        const x = (row as any).coordenadaX || '';
        const y = (row as any).coordenadaY || '';
        if (!x && !y) return <span style={{ color: '#9ca3af' }}>-</span>;

        const numY = parseFloat(y);
        const numX = parseFloat(x);
        const displayCoords = (!isNaN(numY) && !isNaN(numX))
          ? `${numY.toFixed(2)}, ${numX.toFixed(2)}`
          : `${y}, ${x}`;

        const handleOpenMap = (e: React.MouseEvent) => {
          e.stopPropagation();
          const url = `https://earth.google.com/web/search/${y},${x}`;
          try {
            const w = window.open('', 'geo_obra_mapa');
            if (w) {
              w.location.href = url;
              w.focus();
              window.__geoMapWindow = w;
            }
          } catch {
            window.__geoMapWindow = window.open(url, 'geo_obra_mapa') || null;
          }
        };

        return (
          <span
            onClick={handleOpenMap}
            title={`${y}, ${x}`}
            style={{
              fontSize: '0.68rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              cursor: 'pointer',
              color: '#1d4ed8',
            }}
          >
            {displayCoords}
          </span>
        );
      }
    },
    {
      key: 'planoPdf' as any,
      label: 'PLANO',
      width: '6%',
      render: (row) => {
        if (!row.planoPdf) return <span style={{ color: '#9ca3af' }}>-</span>;
        return (
          <a
            href={getPlanoUrl(row.planoPdf)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.7rem',
              textDecoration: 'none',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '2px 6px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap'
            }}
            title="Ver Plano PDF"
          >
            📄 PDF
          </a>
        );
      }
    }
  ];


  const handleConfirmTerminar = async () => {
    if (!selected) return;
    try {
      await obrasService.terminar(
        selected.id,
        terminarForm.fechaTerminoCampo || undefined,
        terminarForm.fechaFinConstruccion || undefined,
      );
      setSelected(null);
      refetch();
    } catch (err) {
      console.error('Error terminando obra:', err);
    }
  };

  const handleConfirmAsignar = async () => {
    if (!assigning) return;
    const currentAssigning = assigning;
    const currentPdf = planoPdf;

    // Close modal instantly for seamless UI response
    setAssigning(null);
    setPlanoPdf(null);

    // Show Apple Loading Overlay HUD
    setProcessingTitle('Asignando Obra');
    setProcessingSubtitle(`Asignando ${currentAssigning.solicitudPo || currentAssigning.obra || 'la obra'}... Por favor espere.`);
    setIsProcessing(true);

    try {
      const { tieneRetiro, contratista, ...payload } = assignForm;
      if (!tieneRetiro) {
        payload.atRetiro = '';
        payload.ordenRetiro = '';
        payload.siadRetiro = '';
      }

      const cleanPayload: any = {
        obra: currentAssigning.obra,
        ...payload,
        diasObraAPORTACIONES: payload.diasObraAPORTACIONES ? Number(payload.diasObraAPORTACIONES) : undefined,
      };

      if (payload.poblacion || payload.nombreSolicitante) {
        const parts = [payload.poblacion, payload.nombreSolicitante].filter(Boolean);
        cleanPayload.rd = parts.join(' ');
      }

      await obrasService.asignar(
        currentAssigning.id,
        cleanPayload,
        currentPdf || undefined,
      );
      await refetch();
    } catch (err: any) {
      console.error('Error asignando obra:', err);
      const msg = err.response?.data?.message || err.message || 'Error inesperado al asignar la obra.';
      const formattedMsg = Array.isArray(msg) ? msg.join(', ') : msg;
      alert(`No se pudo asignar la obra:\n${formattedMsg}`);
      await refetch();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmEdit = async () => {
    if (!editing) return;
    const currentEditing = editing;
    const currentPdf = planoPdf;

    setEditing(null);
    setPlanoPdf(null);

    setProcessingTitle('Guardando Cambios');
    setProcessingSubtitle(`Actualizando ${currentEditing.solicitudPo || currentEditing.obra || 'la obra'}... Por favor espere.`);
    setIsProcessing(true);

    try {
      const { tieneRetiro, contratista, ...payload } = editForm as any;
      if (!tieneRetiro) {
        payload.atRetiro = '';
        payload.ordenRetiro = '';
        payload.siadRetiro = '';
      }

      if (payload.poblacion || payload.nombreSolicitante) {
        const parts = [payload.poblacion, payload.nombreSolicitante].filter(Boolean);
        payload.rd = parts.join(' ');
      }

      if (payload.fechaFinConstruccion) {
        payload.fechaTermino = payload.fechaFinConstruccion;
      }

      const cleanPayload: any = {};
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) {
          if (k === 'diasObraAPORTACIONES' || k === 'diasSinCapitalizar' || k === 'oficioConsecutivo') {
            const num = Number(v);
            if (!isNaN(num)) cleanPayload[k] = num;
          } else {
            cleanPayload[k] = v;
          }
        }
      });

      cleanPayload.solicitudPo = editForm.solicitudPo || currentEditing.solicitudPo;
      if (!cleanPayload.obra && currentEditing.obra) cleanPayload.obra = currentEditing.obra;
      if (!cleanPayload.at && currentEditing.at) cleanPayload.at = currentEditing.at;

      await obrasService.update(cleanPayload as any, currentPdf || undefined);
      await refetch();
    } catch (err) {
      console.error('Error actualizando obra:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNewArea = async () => {
    if (!newAreaName.trim()) return;
    try {
      await areasService.create(newAreaName);
      const list = await areasService.getAll();
      setAreas(list);
      setNewAreaName('');
      setAddingArea(false);
    } catch (err) {
      console.error('Error creating area:', err);
    }
  };

  // Helper calculations for dynamic sorting columns
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper to parse dates locally and avoid UTC shifting
  const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
    const cleanStr = dateStr.split('T')[0].split(' ')[0].trim();
    if (cleanStr.includes('.') || cleanStr.includes('-')) {
      const delimiter = cleanStr.includes('.') ? '.' : '-';
      const parts = cleanStr.split(delimiter);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else if (parts[2].length === 4) {
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        }
      }
    } else if (cleanStr.includes('/')) {
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        } else if (parts[0].length === 4) {
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
      }
    }
    return new Date(dateStr);
  };

  // 1. Días Transcurridos desde la fecha de inicio / pago hasta HOY
  const calculateDias = (row: Obra): number | string => {
    const tipo = (row.tipoObra || '').toUpperCase();
    const isSseebra = tipo === 'SSEEBRA' || tipo === 'APORTACIONES';

    let rawDate = '';
    if (isSseebra) {
      // Para SSEEBRA los días transcurridos son EXCLUSIVAMENTE desde la fecha de pago (sin usar fechaAsignacion)
      rawDate = row.fechaPago || '';
    } else {
      // Para RPT y FSUE son desde la fecha de inicio / asignacion / programada
      rawDate = (row as any).fechaAsignacion || (row as any).fechaProgramada || (row as any).fechaAut || row.fechaPago || '';
    }

    if (!rawDate) return '';
    try {
      const startDate = parseLocalDate(rawDate);
      if (isNaN(startDate.getTime())) return '';
      startDate.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - startDate.getTime();
      const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return elapsedDays >= 0 ? elapsedDays : 0;
    } catch {
      return '';
    }
  };

  // 2. Días por vencer (Días restantes antes del límite)
  const calculateDiasParaVencerse = (row: Obra): number => {
    // Si la obra ya está concluida en campo o capitalizada, no aplica plazo de vencimiento
    if (row.estatus === 'CAPITALIZADA' || row.estatus === 'TERMINADA') {
      return 0;
    }

    // 1. Si existe fechaFinConstruccion (Fecha Definitiva de Término / Límite de Término)
    const rawFinConst = (row as any).fechaFinConstruccion;
    if (rawFinConst && String(rawFinConst).trim() !== '') {
      try {
        const limitDate = parseLocalDate(rawFinConst);
        if (!isNaN(limitDate.getTime())) {
          limitDate.setHours(0, 0, 0, 0);
          const diffTime = limitDate.getTime() - today.getTime();
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      } catch {
        // fallback
      }
    }

    const tipo = (row.tipoObra || '').toUpperCase();
    const isSseebra = tipo === 'SSEEBRA' || tipo === 'APORTACIONES';

    if (isSseebra) {
      const rawPago = row.fechaPago || '';
      if (!rawPago) return 0;
      try {
        const pagoDate = parseLocalDate(rawPago);
        if (isNaN(pagoDate.getTime())) return 0;
        const diasSseebra = Number((row as any).diasObraAPORTACIONES) || 9;
        const limitDate = new Date(pagoDate);
        limitDate.setDate(limitDate.getDate() + diasSseebra);
        limitDate.setHours(0, 0, 0, 0);
        const diffTime = limitDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return 0;
      }
    } else {
      // RPT y FSUE: basarse en fechaProgramada (o fechaAsignacion)
      const rawFechaProg = (row as any).fechaProgramada || (row as any).fechaAsignacion;
      if (!rawFechaProg) return 0;
      try {
        const progDate = parseLocalDate(rawFechaProg);
        if (isNaN(progDate.getTime())) return 0;
        progDate.setHours(0, 0, 0, 0);
        const diffTime = progDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return 0;
      }
    }
  };

  const getSortGroupRank = (row: Obra): number => {
    const isCapitalizada = row.estatus === 'CAPITALIZADA';
    const hasFechaFin = !!(row.fechaFinConstruccion || (row as any).fechaTermino);
    const hasFechaCampo = !!(row.fechaTerminoCampo && String(row.fechaTerminoCampo).trim() !== '');

    // 1. Primero arriba: Obras CAPITALIZADAS
    if (isCapitalizada) return 1;

    // 2. Segundo: Obras con AMBAS fechas (Fin de Construcción Y Término en Campo)
    if (hasFechaFin && hasFechaCampo) return 2;

    // 3. Tercero: Obras con Fecha de Término en Campo (pero sin Fin de Construcción)
    if (hasFechaCampo && !hasFechaFin) return 3;

    // 4. Cuarto: Obras con Fecha de Término de Construcción PERO NO tienen Fecha en Campo
    if (hasFechaFin && !hasFechaCampo) return 4;

    // 5. Finalmente hasta abajo: Las demás obras (pendientes/asignadas sin fechas)
    return 5;
  };

  const customSortObras = (a: Obra, b: Obra): number => {
    const rankA = getSortGroupRank(a);
    const rankB = getSortGroupRank(b);

    if (rankA !== rankB) {
      return rankA - rankB; // Rank 1 -> Rank 2 -> Rank 3 -> Rank 4 -> Rank 5
    }

    // Dentro del mismo grupo: Ordenar por 'dias' (Días transcurridos) de MAYOR a MENOR (descendente)
    const diasA = typeof (a as any).dias === 'number' ? (a as any).dias : (parseInt((a as any).dias, 10) || 0);
    const diasB = typeof (b as any).dias === 'number' ? (b as any).dias : (parseInt((b as any).dias, 10) || 0);

    return diasB - diasA; // Mayor a Menor
  };

  const processedObras = obras.map((o) => {
    const dias = calculateDias(o);
    const diasParaVencerse = calculateDiasParaVencerse(o);
    return {
      ...o,
      dias,
      diasParaVencerse,
    };
  });



  return (
    <div>
      <h1 className="page-title">
        <span>⚡ Panel de Control de Obras</span>
      </h1>

      {loading ? (
        <Typography>Cargando obras...</Typography>
      ) : (
        <ReusableTable columns={columns} rows={processedObras} customSort={customSortObras} />
      )}

      {/* Modal para Terminar / Registrar Término de Obra */}
      <ReusableModal
        open={!!selected}
        title={`Registrar Término - ${selected?.solicitudPo || selected?.obra || ''}`}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirmTerminar}
        confirmLabel="Guardar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <TextField
            label="Fecha Término en Campo"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={terminarForm.fechaTerminoCampo}
            onChange={(e) => setTerminarForm({ ...terminarForm, fechaTerminoCampo: e.target.value })}
            helperText="Fecha en que se concluyeron los trabajos físicos en campo."
            fullWidth
          />
          <TextField
            label="Fecha de Término (Fin de Construcción)"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={terminarForm.fechaFinConstruccion}
            onChange={(e) => setTerminarForm({ ...terminarForm, fechaFinConstruccion: e.target.value })}
            helperText="Al capturar la Fecha de Término, la obra pasará a estatus TERMINADA."
            fullWidth
          />
        </div>
      </ReusableModal>

      {/* Modal para Asignar Obra */}
      <ReusableModal
        open={!!assigning}
        title={`Asignar Obra / PO: ${assigning?.solicitudPo}`}
        onClose={() => setAssigning(null)}
        onConfirm={handleConfirmAsignar}
        confirmLabel="Asignar"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="AT"
              size="small"
              value={assignForm.at}
              onChange={(e) => setAssignForm({ ...assignForm, at: e.target.value })}
              fullWidth
            />
            <TextField
              label="Activo"
              size="small"
              value={assignForm.activo}
              onChange={(e) => setAssignForm({ ...assignForm, activo: e.target.value })}
              fullWidth
            />
            <TextField
              label="Orden"
              size="small"
              value={assignForm.orden}
              onChange={(e) => setAssignForm({ ...assignForm, orden: e.target.value })}
              fullWidth
            />
          </div>

          <TextField
            label="Nombre"
            size="small"
            value={assignForm.nombreSolicitante}
            onChange={(e) => setAssignForm({ ...assignForm, nombreSolicitante: e.target.value })}
            fullWidth
          />

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Población"
              size="small"
              value={assignForm.poblacion}
              onChange={(e) => setAssignForm({ ...assignForm, poblacion: e.target.value })}
              fullWidth
            />
            <TextField
              label="Municipio"
              size="small"
              value={assignForm.municipio}
              onChange={(e) => setAssignForm({ ...assignForm, municipio: e.target.value })}
              fullWidth
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Coordenada X (Longitud)"
              size="small"
              value={assignForm.coordenadaX}
              onChange={(e) => setAssignForm({ ...assignForm, coordenadaX: e.target.value })}
              fullWidth
            />
            <TextField
              label="Coordenada Y (Latitud)"
              size="small"
              value={assignForm.coordenadaY}
              onChange={(e) => setAssignForm({ ...assignForm, coordenadaY: e.target.value })}
              fullWidth
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              select
              label="Tipo de Obra"
              size="small"
              value={assignForm.tipoObra}
              onChange={(e) =>
                setAssignForm({ ...assignForm, tipoObra: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="SSEEBRA">SSEEBRA</MenuItem>
              <MenuItem value="RPT">RPT</MenuItem>
              <MenuItem value="FSUE">FSUE</MenuItem>
            </TextField>

            {assignForm.tipoObra === 'APORTACIONES' ? (
              <>
                <TextField
                  label="Fecha de Pago"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={assignForm.fechaPago}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, fechaPago: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Días SSEEBRA"
                  type="number"
                  size="small"
                  value={assignForm.diasObraAPORTACIONES}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, diasObraAPORTACIONES: e.target.value })
                  }
                  fullWidth
                />
              </>
            ) : (assignForm.tipoObra === 'RPT' || assignForm.tipoObra === 'FSUE') ? (
              <TextField
                label="Fecha Programada"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={assignForm.fechaProgramada}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, fechaProgramada: e.target.value })
                }
                fullWidth
              />
            ) : (
              <div style={{ width: '100%' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              select
              label="Contrato"
              size="small"
              value={assignForm.contrato}
              onChange={(e) => handleContratoChange(e.target.value)}
              fullWidth
            >
              {contratos.map((c) => (
                <MenuItem key={c.numeroContrato} value={c.numeroContrato}>
                  {c.numeroContrato} - {c.contratista}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha de Asignación"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={assignForm.fechaAsignacion}
              onChange={(e) =>
                setAssignForm({ ...assignForm, fechaAsignacion: e.target.value })
              }
              fullWidth
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Contratista"
              size="small"
              value={assignForm.contratista || ''}
              InputProps={{ readOnly: true }}
              disabled
              fullWidth
            />
            <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={assignForm.tieneRetiro}
                    onChange={(e) => setAssignForm({ ...assignForm, tieneRetiro: e.target.checked })}
                    color="primary"
                  />
                }
                label="Tiene Orden de Retiro"
              />
            </div>
          </div>

          <TextField
            select
            label="Área de Zona"
            size="small"
            value={assignForm.area || ''}
            onChange={(e) => {
              if (e.target.value === 'ADD_NEW_AREA') {
                setAddingArea(true);
              } else {
                setAssignForm({ ...assignForm, area: e.target.value });
              }
            }}
            fullWidth
          >
            <MenuItem value=""><em>Ninguna</em></MenuItem>
            {areas.map((a) => (
              <MenuItem key={a.nombreArea} value={a.nombreArea}>
                {a.nombreArea}
              </MenuItem>
            ))}
            <MenuItem
              value="ADD_NEW_AREA"
              style={{
                color: '#008E60',
                fontWeight: 'bold',
                borderTop: '1px solid #e2e8f0',
                marginTop: '4px',
              }}
            >
              + AGREGAR ÁREA
            </MenuItem>
          </TextField>

          {assignForm.tieneRetiro && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <TextField
                label="AT de Retiro"
                size="small"
                value={assignForm.atRetiro}
                onChange={(e) => setAssignForm({ ...assignForm, atRetiro: e.target.value })}
                fullWidth
              />
              <TextField
                label="SIAD de Retiro"
                size="small"
                value={assignForm.siadRetiro}
                onChange={(e) => setAssignForm({ ...assignForm, siadRetiro: e.target.value })}
                fullWidth
              />
              <TextField
                label="Orden de Retiro"
                size="small"
                value={assignForm.ordenRetiro}
                onChange={(e) => setAssignForm({ ...assignForm, ordenRetiro: e.target.value })}
                fullWidth
              />
            </div>
          )}


          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <div style={{ width: '100%' }}>
              <UploadPdf onFileSelected={(file) => setPlanoPdf(file)} />
            </div>
          </div>
        </div>
      </ReusableModal>

      {/* Modal de Previsualización de Detalles de la Obra */}
      <Dialog
        open={!!previewObra}
        onClose={() => setPreviewObra(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '20px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
          },
        }}
      >
        {previewObra && (
          <>
            {/* Header del Modal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                  }}
                >
                  <AssignmentIcon fontSize="medium" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.2 }}>
                      Detalles de la Obra
                    </Typography>
                    <span
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '2px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      }}
                    >
                      {previewObra.solicitudPo}
                    </span>
                  </div>
                  <Typography style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Información detallada, fechas de pago y compromisos de ejecución
                  </Typography>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(() => {
                  const est = previewObra.estatus;
                  let bg = '#f1f5f9';
                  let fg = '#475569';
                  let border = '#e2e8f0';
                  if (est === 'CAPITALIZADA') {
                    bg = '#ecfdf5'; fg = '#047857'; border = '#a7f3d0';
                  } else if (est === 'TERMINADA') {
                    bg = '#eff6ff'; fg = '#1d4ed8'; border = '#bfdbfe';
                  } else if (est === 'ASIGNADA') {
                    bg = '#fffbeb'; fg = '#b45309'; border = '#fde68a';
                  } else if (est === 'PENDIENTE') {
                    bg = '#f8fafc'; fg = '#64748b'; border = '#e2e8f0';
                  }
                  return (
                    <span
                      style={{
                        backgroundColor: bg,
                        color: fg,
                        border: `1px solid ${border}`,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {est}
                    </span>
                  );
                })()}

                <IconButton
                  size="small"
                  onClick={() => setPreviewObra(null)}
                  style={{ color: '#64748b', padding: '6px' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            </div>

            {/* Contenido con scroll elegante */}
            <DialogContent
              style={{
                padding: '20px 24px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: 'calc(85vh - 130px)',
              }}
            >
              {/* Tarjeta destacada: FECHA DE PAGO Y PLAZO */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PaymentsIcon style={{ color: '#059669', fontSize: '1.25rem' }} />
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Información de Pago y Plazo
                    </span>
                  </div>
                  {/* Badge de Días */}
                  {(() => {
                    const dias = (previewObra as any).diasObraAPORTACIONES;
                    if (dias) {
                      return (
                        <span
                          style={{
                            backgroundColor: dias === 28 ? '#eff6ff' : '#fee2e2',
                            color: dias === 28 ? '#1d4ed8' : '#dc2626',
                            border: `1px solid ${dias === 28 ? '#bfdbfe' : '#fca5a5'}`,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                          }}
                        >
                          Plazo: {dias} Días
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* Fecha de Pago destacada */}
                  <div
                    style={{
                      backgroundColor: (previewObra as any).fechaPago ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${(previewObra as any).fechaPago ? '#bbf7d0' : '#e2e8f0'}`,
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: (previewObra as any).fechaPago ? '#dcfce7' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: (previewObra as any).fechaPago ? '#15803d' : '#94a3b8',
                      }}
                    >
                      <PaymentsIcon fontSize="small" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                        Fecha de Pago
                      </span>
                      <strong style={{ fontSize: '1rem', color: (previewObra as any).fechaPago ? '#15803d' : '#94a3b8' }}>
                        {(previewObra as any).fechaPago || 'Sin registrar'}
                      </strong>
                    </div>
                  </div>

                  {/* Fecha de Asignación */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                      }}
                    >
                      <CalendarMonthIcon fontSize="small" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                        Fecha de Asignación
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                        {previewObra.fechaAsignacion || 'Sin registrar'}
                      </strong>
                    </div>
                  </div>

                  {/* Fecha de Término / Límite */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                      }}
                    >
                      <CalendarMonthIcon fontSize="small" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                        Fin Construcción / Término
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                        {previewObra.fechaFinConstruccion || (previewObra as any).fechaTermino || 'Sin registrar'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de 2 Columnas para Clasificación y Ubicación */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                {/* Tarjeta: Clasificación e Identificadores */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                    <BusinessIcon style={{ color: '#2563eb', fontSize: '1.2rem' }} />
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Identificación y Contrato
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.86rem' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>AT</span>
                      <span style={{ fontWeight: 800, color: '#0f172a', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>
                        {previewObra.at || '-'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Obra / SIAD</span>
                      <strong style={{ color: '#0f172a' }}>{previewObra.obra || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Tipo de Obra</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <strong style={{ color: '#0f172a' }}>{previewObra.tipoObra || '-'}</strong>
                        {((previewObra.tipoObra || '').toUpperCase() === 'SSEEBRA' || (previewObra.tipoObra || '').toUpperCase() === 'APORTACIONES') && (
                          <span
                            style={{
                              backgroundColor: (previewObra as any).diasObraAPORTACIONES === 28 ? '#eff6ff' : '#fee2e2',
                              color: (previewObra as any).diasObraAPORTACIONES === 28 ? '#1d4ed8' : '#dc2626',
                              border: `1px solid ${(previewObra as any).diasObraAPORTACIONES === 28 ? '#bfdbfe' : '#fca5a5'}`,
                              padding: '1px 6px',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.65rem',
                            }}
                          >
                            {(previewObra as any).diasObraAPORTACIONES || 9}D
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Año</span>
                      <strong style={{ color: '#0f172a' }}>{previewObra.anio || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Activo</span>
                      <strong style={{ color: '#0f172a' }}>{previewObra.activo || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Orden</span>
                      <strong style={{ color: '#0f172a' }}>{previewObra.orden || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Contrato</span>
                      <strong style={{ color: '#0f172a' }}>{previewObra.contrato || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Contratista</span>
                      <strong style={{ color: '#0f172a' }}>{previewObra.contratista || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Zona</span>
                      <strong style={{ color: '#0f172a' }}>{(previewObra as any).zona || 'PATZCUARO'}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Área</span>
                      <strong style={{ color: '#0f172a' }}>{(previewObra as any).area || '-'}</strong>
                    </div>
                  </div>
                </div>

                {/* Tarjeta: Solicitante y Ubicación */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                    <PersonIcon style={{ color: '#6366f1', fontSize: '1.2rem' }} />
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Solicitante y Ubicación
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                    {/* Solicitante Destacado */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                        Nombre del Solicitante
                      </span>
                      <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                        {previewObra.nombreSolicitante || '-'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                        RD (Población / Solicitante)
                      </span>
                      <strong style={{ color: '#0f172a' }}>
                        {(() => {
                          const cleanPoblacion = ((previewObra as any).poblacion || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
                          const cleanRd = (previewObra.rd || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
                          const poblacion = cleanPoblacion || cleanRd;
                          const nombre = (previewObra.nombreSolicitante || '').trim();
                          const parts = [poblacion, nombre].filter(Boolean).join(' ');
                          return parts || cleanRd || previewObra.rd || '-';
                        })()}
                      </strong>
                    </div>

                    {(previewObra as any).municipio && (
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                          Municipio
                        </span>
                        <strong style={{ color: '#0f172a' }}>{(previewObra as any).municipio}</strong>
                      </div>
                    )}

                    {/* Coordenadas */}
                    <div style={{ marginTop: '2px', padding: '8px 10px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                          Coordenadas (Lat, Long)
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1e293b' }}>
                          {previewObra.coordenadaY && previewObra.coordenadaX
                            ? `${previewObra.coordenadaY}, ${previewObra.coordenadaX}`
                            : 'Sin coordenadas registradas'}
                        </span>
                      </div>
                      {previewObra.coordenadaY && previewObra.coordenadaX && (
                        <Button
                          size="small"
                          variant="outlined"
                          target="_blank"
                          href={`https://www.google.com/maps?q=${previewObra.coordenadaY},${previewObra.coordenadaX}`}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            minWidth: 'auto',
                            borderColor: '#cbd5e1',
                            color: '#1e293b',
                            backgroundColor: '#ffffff',
                            textTransform: 'none',
                          }}
                          startIcon={<LocationOnIcon style={{ color: '#ef4444', fontSize: '0.9rem' }} />}
                        >
                          Ver Mapa
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta: Otras Fechas de Seguimiento */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                  <CalendarMonthIcon style={{ color: '#8b5cf6', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Otras Fechas de Seguimiento
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Fecha Programada</span>
                    <strong style={{ color: '#0f172a' }}>{(previewObra as any).fechaProgramada || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Término en Campo</span>
                    <strong style={{ color: '#0f172a' }}>{previewObra.fechaTerminoCampo || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Fecha Autorización</span>
                    <strong style={{ color: '#0f172a' }}>{(previewObra as any).fechaAut || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Fecha Supervisión</span>
                    <strong style={{ color: '#0f172a' }}>{(previewObra as any).fechaSupervision || '-'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Fecha Capitalización</span>
                    <strong style={{ color: '#0f172a' }}>{previewObra.fechaCapitalizacion || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Retiro (Solo si aplica) */}
              {((previewObra as any).atRetiro || (previewObra as any).ordenRetiro || (previewObra as any).siadRetiro) && (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '14px',
                    padding: '14px 18px',
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#b45309', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                    ⚠️ Datos de Retiro
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#92400e', fontSize: '0.72rem', fontWeight: 700, display: 'block' }}>AT de Retiro</span>
                      <strong style={{ color: '#78350f' }}>{(previewObra as any).atRetiro || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#92400e', fontSize: '0.72rem', fontWeight: 700, display: 'block' }}>SIAD de Retiro</span>
                      <strong style={{ color: '#78350f' }}>{(previewObra as any).siadRetiro || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#92400e', fontSize: '0.72rem', fontWeight: 700, display: 'block' }}>Orden de Retiro</span>
                      <strong style={{ color: '#78350f' }}>{(previewObra as any).ordenRetiro || '-'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tarjeta: Plano y Archivos */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: (previewObra as any).planoPdf ? '#fee2e2' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: (previewObra as any).planoPdf ? '#dc2626' : '#94a3b8',
                    }}
                  >
                    <PictureAsPdfIcon />
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '0.92rem', display: 'block' }}>
                      Plano del Proyecto
                    </strong>
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      {(previewObra as any).planoPdf
                        ? `Archivo PDF vinculado (${previewObra.at || 'Obra'}_${previewObra.obra || 'Plano'}.pdf)`
                        : 'No se ha adjuntado ningún archivo PDF a esta obra'}
                    </span>
                  </div>
                </div>

                {(previewObra as any).planoPdf ? (
                  <Button
                    variant="contained"
                    size="small"
                    href={getPlanoUrl((previewObra as any).planoPdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderRadius: '8px',
                      padding: '6px 14px',
                      textTransform: 'none',
                    }}
                    startIcon={<PictureAsPdfIcon fontSize="small" />}
                    endIcon={<OpenInNewIcon fontSize="small" />}
                  >
                    Abrir Plano PDF
                  </Button>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    Sin plano cargado
                  </span>
                )}
              </div>
            </DialogContent>

            {/* Footer / Acciones */}
            <DialogActions
              style={{
                borderTop: '1px solid #e2e8f0',
                padding: '14px 24px',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Button
                onClick={() => {
                  const row = previewObra;
                  if (row) {
                    setPreviewObra(null);
                    setEditing(row);
                    setEditForm({
                      solicitudPo: row.solicitudPo,
                      at: row.at || '',
                      obra: row.obra || '',
                      anio: row.anio || '',
                      tipoObra: row.tipoObra || '',
                      activo: row.activo || '',
                      orden: row.orden || '',
                      poblacion: (row as any).poblacion || '',
                      municipio: (row as any).municipio || '',
                      nombreSolicitante: row.nombreSolicitante || '',
                      coordenadaX: row.coordenadaX || '',
                      coordenadaY: row.coordenadaY || '',
                      contrato: row.contrato || '',
                      contratista: (row as any).contratista || '',
                      tieneRetiro: !!(row as any).ordenRetiro || !!(row as any).atRetiro,
                      atRetiro: (row as any).atRetiro || '',
                      siadRetiro: (row as any).siadRetiro || '',
                      ordenRetiro: (row as any).ordenRetiro || '',
                      fechaPago: formatDateForInput((row as any).fechaPago),
                      fechaProgramada: formatDateForInput((row as any).fechaProgramada),
                      fechaAut: formatDateForInput((row as any).fechaAut),
                      fechaSupervision: formatDateForInput((row as any).fechaSupervision),
                      fechaAsignacion: formatDateForInput(row.fechaAsignacion),
                      fechaFinConstruccion: formatDateForInput((row as any).fechaFinConstruccion || (row as any).fechaTermino),
                      fechaTerminoCampo: formatDateForInput(row.fechaTerminoCampo),
                      fechaCapitalizacion: formatDateForInput(row.fechaCapitalizacion),
                      estatus: row.estatus || '',
                      area: (row as any).area || '',
                      diasObraAPORTACIONES: (row as any).diasObraAPORTACIONES || '',
                    });
                  }
                }}
                variant="contained"
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '8px 18px',
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                }}
                startIcon={<EditIcon />}
              >
                Editar Obra
              </Button>

              <Button
                onClick={() => setPreviewObra(null)}
                variant="outlined"
                style={{
                  color: '#475569',
                  borderColor: '#cbd5e1',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal para Editar Obra */}
      <ReusableModal
        open={!!editing}
        title={`Editar Obra / PO: ${editing?.solicitudPo}`}
        onClose={() => setEditing(null)}
        onConfirm={handleConfirmEdit}
        confirmLabel="Guardar"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            paddingTop: '28px',
            paddingBottom: '20px',
            paddingLeft: '8px',
            paddingRight: '14px',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="AT"
              size="small"
              value={editForm.at}
              onChange={(e) => setEditForm({ ...editForm, at: e.target.value })}
              fullWidth
            />
            <TextField
              label="Activo"
              size="small"
              value={editForm.activo}
              onChange={(e) => setEditForm({ ...editForm, activo: e.target.value })}
              fullWidth
            />
            <TextField
              label="Orden"
              size="small"
              value={editForm.orden}
              onChange={(e) => setEditForm({ ...editForm, orden: e.target.value })}
              fullWidth
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Obra / SIAD"
              size="small"
              value={editForm.obra}
              onChange={(e) => setEditForm({ ...editForm, obra: e.target.value })}
              fullWidth
            />
            <TextField
              label="Año"
              size="small"
              value={editForm.anio}
              onChange={(e) => setEditForm({ ...editForm, anio: e.target.value })}
              fullWidth
            />
          </div>

          <TextField
            label="Nombre del Solicitante"
            size="small"
            value={editForm.nombreSolicitante}
            onChange={(e) => setEditForm({ ...editForm, nombreSolicitante: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Población"
              size="small"
              value={editForm.poblacion}
              onChange={(e) => setEditForm({ ...editForm, poblacion: e.target.value })}
              fullWidth
            />
            <TextField
              label="Municipio"
              size="small"
              value={editForm.municipio}
              onChange={(e) => setEditForm({ ...editForm, municipio: e.target.value })}
              fullWidth
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Coordenada X"
              size="small"
              value={editForm.coordenadaX}
              onChange={(e) => setEditForm({ ...editForm, coordenadaX: e.target.value })}
              fullWidth
            />
            <TextField
              label="Coordenada Y"
              size="small"
              value={editForm.coordenadaY}
              onChange={(e) => setEditForm({ ...editForm, coordenadaY: e.target.value })}
              fullWidth
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              select
              label="Tipo de Obra"
              size="small"
              value={editForm.tipoObra}
              onChange={(e) => setEditForm({ ...editForm, tipoObra: e.target.value })}
              fullWidth
            >
              <MenuItem value="SSEEBRA">SSEEBRA</MenuItem>
              <MenuItem value="RPT">RPT</MenuItem>
              <MenuItem value="FSUE">FSUE</MenuItem>
            </TextField>

            {editForm.tipoObra === 'APORTACIONES' ? (
              <>
                <TextField
                  label="Fecha de Pago"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={editForm.fechaPago}
                  onChange={(e) => setEditForm({ ...editForm, fechaPago: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Días SSEEBRA"
                  type="number"
                  size="small"
                  value={editForm.diasObraAPORTACIONES}
                  onChange={(e) => setEditForm({ ...editForm, diasObraAPORTACIONES: e.target.value })}
                  fullWidth
                />
              </>
            ) : (editForm.tipoObra === 'RPT' || editForm.tipoObra === 'FSUE') ? (
              <TextField
                label="Fecha Programada"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editForm.fechaProgramada}
                onChange={(e) => setEditForm({ ...editForm, fechaProgramada: e.target.value })}
                fullWidth
              />
            ) : (
              <div style={{ width: '100%' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              select
              label="Contrato"
              size="small"
              value={editForm.contrato}
              onChange={(e) => {
                const selected = contratos.find((c) => c.numeroContrato === e.target.value);
                setEditForm({
                  ...editForm,
                  contrato: e.target.value,
                  contratista: selected ? (selected.contratista || '') : '',
                });
              }}
              fullWidth
            >
              <MenuItem value=""><em>Ninguno</em></MenuItem>
              {contratos.map((c) => (
                <MenuItem key={c.numeroContrato} value={c.numeroContrato}>
                  {c.numeroContrato} - {c.contratista}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Contratista"
              size="small"
              value={editForm.contratista || ''}
              InputProps={{ readOnly: true }}
              disabled
              fullWidth
            />
          </div>

          <TextField
            select
            label="Área de Zona"
            size="small"
            value={editForm.area || ''}
            onChange={(e) => {
              if (e.target.value === 'ADD_NEW_AREA') {
                setAddingArea(true);
              } else {
                setEditForm({ ...editForm, area: e.target.value });
              }
            }}
            fullWidth
          >
            <MenuItem value=""><em>Ninguna</em></MenuItem>
            {areas.map((a) => (
              <MenuItem key={a.nombreArea} value={a.nombreArea}>
                {a.nombreArea}
              </MenuItem>
            ))}
            <MenuItem
              value="ADD_NEW_AREA"
              style={{
                color: '#008E60',
                fontWeight: 'bold',
                borderTop: '1px solid #e2e8f0',
                marginTop: '4px',
              }}
            >
              + AGREGAR ÁREA
            </MenuItem>
          </TextField>

          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              select
              label="Estatus"
              size="small"
              value={editForm.estatus}
              onChange={(e) => setEditForm({ ...editForm, estatus: e.target.value })}
              fullWidth
            >
              <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
              <MenuItem value="ASIGNADA">ASIGNADA</MenuItem>
              <MenuItem value="TERMINADA">TERMINADA</MenuItem>
              <MenuItem value="CAPITALIZADA">CAPITALIZADA</MenuItem>
            </TextField>

            <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.tieneRetiro}
                    onChange={(e) => setEditForm({ ...editForm, tieneRetiro: e.target.checked })}
                    color="primary"
                  />
                }
                label="Tiene Orden de Retiro"
              />
            </div>
          </div>

          {editForm.tieneRetiro && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <TextField
                label="AT de Retiro"
                size="small"
                value={editForm.atRetiro}
                onChange={(e) => setEditForm({ ...editForm, atRetiro: e.target.value })}
                fullWidth
              />
              <TextField
                label="SIAD de Retiro"
                size="small"
                value={editForm.siadRetiro}
                onChange={(e) => setEditForm({ ...editForm, siadRetiro: e.target.value })}
                fullWidth
              />
              <TextField
                label="Orden de Retiro"
                size="small"
                value={editForm.ordenRetiro}
                onChange={(e) => setEditForm({ ...editForm, ordenRetiro: e.target.value })}
                fullWidth
              />
            </div>
          )}

          {/* Fechas de Seguimiento */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', fontSize: '0.95rem' }}>
              📅 Fechas de Seguimiento
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <TextField
                label="Fecha de Autorización"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editForm.fechaAut}
                onChange={(e) => setEditForm({ ...editForm, fechaAut: e.target.value })}
                fullWidth
              />
              <TextField
                label="Fecha de Supervisión"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editForm.fechaSupervision}
                onChange={(e) => setEditForm({ ...editForm, fechaSupervision: e.target.value })}
                fullWidth
              />
              <TextField
                label="Fecha de Asignación"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editForm.fechaAsignacion}
                onChange={(e) => setEditForm({ ...editForm, fechaAsignacion: e.target.value })}
                fullWidth
              />
              <TextField
                label="Fecha de Término"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editForm.fechaFinConstruccion}
                onChange={(e) => setEditForm({ ...editForm, fechaFinConstruccion: e.target.value })}
                fullWidth
              />
              <TextField
                label="Fecha Término en Campo"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editForm.fechaTerminoCampo}
                onChange={(e) => setEditForm({ ...editForm, fechaTerminoCampo: e.target.value })}
                fullWidth
              />
              <TextField
                label="Fecha de Capitalización"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editForm.fechaCapitalizacion}
                onChange={(e) => setEditForm({ ...editForm, fechaCapitalizacion: e.target.value })}
                fullWidth
              />
            </div>
          </div>

          {/* Plano PDF */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', fontSize: '0.95rem' }}>
              📄 Plano PDF de la Obra
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, color: '#008E60', borderColor: '#008E60' }}
              >
                {planoPdf ? 'Cambiar Archivo PDF' : 'Adjuntar Plano PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setPlanoPdf(e.target.files?.[0] || null)}
                />
              </Button>
              {planoPdf ? (
                <Typography variant="body2" style={{ color: '#059669', fontWeight: 600 }}>
                  📄 Seleccionado: {planoPdf.name}
                </Typography>
              ) : editing?.planoPdf ? (
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  href={getPlanoUrl(editing.planoPdf)}
                  target="_blank"
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Ver Plano PDF Actual
                </Button>
              ) : (
                <Typography variant="body2" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Sin plano adjunto
                </Typography>
              )}
            </div>
          </div>
        </div>
      </ReusableModal>

      {/* Dialog para agregar nueva área */}
      <Dialog open={addingArea} onClose={() => setAddingArea(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ fontWeight: 'bold' }}>Agregar Nueva Área de Zona</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre del Área"
            size="small"
            fullWidth
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            style={{ marginTop: '8px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddingArea(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: '#008E60' }}
            onClick={handleSaveNewArea}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Overlay con Animación estilo Apple */}
      <AppleLoadingOverlay
        open={isProcessing}
        title={processingTitle}
        subtitle={processingSubtitle}
      />
    </div>
  );
}
