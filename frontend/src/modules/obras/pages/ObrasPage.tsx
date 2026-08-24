import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, MenuItem, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useObras } from '../hooks/useObras';
import { obrasService, areasService } from '../services/obras.service';
import { contratosService } from '../../contratos/services/contratos.service';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import ReusableModal from '../../../components/Modal/ReusableModal';
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

export default function ObrasPage() {
  const { obras, loading, refetch } = useObras();
  const [selected, setSelected] = useState<Obra | null>(null);
  const [previewObra, setPreviewObra] = useState<Obra | null>(null);
  const [fechaTermino, setFechaTermino] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  // Contracts list state
  const [contratos, setContratos] = useState<any[]>([]);

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
    const loadContratos = async () => {
      try {
        const list = await contratosService.getAll();
        setContratos(list);
      } catch (err) {
        console.error('Error cargando contratos en la vista de obras:', err);
      }
    };
    const loadAreas = async () => {
      try {
        const list = await areasService.getAll();
        setAreas(list);
      } catch (err) {
        console.error('Error cargando áreas de zona:', err);
      }
    };
    loadContratos();
    loadAreas();
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
      width: '12%',
      render: (row) => {
        const parts = [];
        if ((row as any).poblacion) parts.push((row as any).poblacion.toUpperCase());
        if ((row as any).municipio) parts.push(`MUNICIPIO DE ${(row as any).municipio.toUpperCase()}`);
        const text = parts.length > 0 ? parts.join(' ') : (row.rd || '');
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
      key: 'nombreSolicitante',
      label: 'Nombre',
      width: '14%',
      render: (row) => (
        <div
          title={row.nombreSolicitante || ''}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.72rem',
            lineHeight: '1.2',
            textAlign: 'left'
          }}
        >
          {row.nombreSolicitante || '-'}
        </div>
      )
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
            setFechaTermino(new Date().toISOString().slice(0, 10));
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
        // Para obras ya concluidas (con fecha de término, capitalizadas o terminadas), poner vacío / guión
        if (row.fechaTerminoCampo || row.estatus === 'CAPITALIZADA' || row.estatus === 'TERMINADA' || (row as any).fechaFinConstruccion) {
          return <span style={{ color: '#9ca3af', fontWeight: 600 }}>-</span>;
        }

        const days = typeof row.diasParaVencerse === 'number' ? row.diasParaVencerse : 0;
        let bg = '#dcfce7'; // Verde (11+ días)
        let fg = '#15803d';
        let border = '1px solid #86efac';

        if (days >= 0 && days <= 3) {
          bg = '#fee2e2'; // Rojo (0 a 3 días)
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
            {days} {days === 1 ? 'día' : 'días'}
          </span>
        );
      },
    },
    {
      key: 'dias' as any,
      label: 'Días',
      width: '4%',
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
    }
  ];


  const handleConfirmTerminar = async () => {
    if (!selected) return;
    try {
      await obrasService.terminar(selected.id, fechaTermino);
      setSelected(null);
      refetch();
    } catch (err) {
      console.error('Error terminando obra:', err);
    }
  };

  const handleConfirmAsignar = async () => {
    if (!assigning) return;
    try {
      const { tieneRetiro, contratista, ...payload } = assignForm;
      if (!tieneRetiro) {
        payload.atRetiro = '';
        payload.ordenRetiro = '';
        payload.siadRetiro = '';
      }

      const cleanPayload: any = {
        ...payload,
        diasObraAPORTACIONES: payload.diasObraAPORTACIONES ? Number(payload.diasObraAPORTACIONES) : undefined,
      };

      if (payload.poblacion && payload.municipio) {
        cleanPayload.rd = `${payload.poblacion} municipio de ${payload.municipio}`;
      }

      await obrasService.asignar(
        assigning.id,
        cleanPayload,
        planoPdf || undefined,
      );
      setAssigning(null);
      refetch();
    } catch (err) {
      console.error('Error asignando obra:', err);
    }
  };

  const handleConfirmEdit = async () => {
    if (!editing) return;
    try {
      const { tieneRetiro, contratista, ...payload } = editForm as any;
      if (!tieneRetiro) {
        payload.atRetiro = '';
        payload.ordenRetiro = '';
        payload.siadRetiro = '';
      }

      if (payload.poblacion && payload.municipio) {
        payload.rd = `${payload.poblacion} municipio de ${payload.municipio}`;
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

      cleanPayload.solicitudPo = editForm.solicitudPo || editing.solicitudPo;

      await obrasService.update(cleanPayload as any, planoPdf || undefined);
      setEditing(null);
      setPlanoPdf(null);
      refetch();
    } catch (err) {
      console.error('Error actualizando obra:', err);
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
      // Para SSEEBRA los días transcurridos son desde que se pagó la obra
      rawDate = row.fechaPago || (row as any).fechaAsignacion || (row as any).fechaProgramada || (row as any).fechaAut || '';
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
    // Si la obra ya está concluida o capitalizada, no aplica plazo de vencimiento
    if (row.estatus === 'CAPITALIZADA' || row.estatus === 'TERMINADA' || (row as any).fechaTerminoCampo) {
      return 0;
    }

    const tipo = (row.tipoObra || '').toUpperCase();
    const isSseebra = tipo === 'SSEEBRA' || tipo === 'APORTACIONES';

    if (isSseebra) {
      const rawPago = row.fechaPago || (row as any).fechaAsignacion;
      if (!rawPago) return 0;
      try {
        const pagoDate = parseLocalDate(rawPago);
        if (isNaN(pagoDate.getTime())) return 0;
        const diasSseebra = row.diasObraAPORTACIONES || 9;
        const limitDate = new Date(pagoDate);
        limitDate.setDate(limitDate.getDate() + diasSseebra);
        limitDate.setHours(0, 0, 0, 0);
        const diffTime = limitDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return daysLeft < 0 ? 0 : daysLeft;
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
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return daysLeft < 0 ? 0 : daysLeft;
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

      {/* Modal para Terminar Obra */}
      <ReusableModal
        open={!!selected}
        title="Terminar Obra en Campo"
        onClose={() => setSelected(null)}
        onConfirm={handleConfirmTerminar}
      >
        <div style={{ marginTop: '8px' }}>
          <TextField
            label="Fecha Término en Campo"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={fechaTermino}
            onChange={(e) => setFechaTermino(e.target.value)}
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
            borderRadius: '12px',
            padding: '8px',
          }
        }}
      >
        <DialogTitle style={{ fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          Detalles de la Obra: {previewObra?.solicitudPo}
        </DialogTitle>
        <DialogContent style={{ marginTop: '16px' }}>
          {previewObra && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: '#64748b' }}>Estatus:</strong>{' '}
                <span style={{ fontWeight: '700', color: previewObra.estatus === 'CAPITALIZADA' ? '#008E60' : '#d97706' }}>
                  {previewObra.estatus}
                </span>
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>AT:</strong> {previewObra.at || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Obra / SIAD:</strong> {previewObra.obra || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Año:</strong> {previewObra.anio || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Tipo de Obra:</strong> {previewObra.tipoObra || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Activo:</strong> {previewObra.activo || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Orden:</strong> {previewObra.orden || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>RD (Población/Municipio):</strong>{' '}
                {`${(previewObra as any).poblacion || ''} ${(previewObra as any).municipio ? `MUNICIPIO DE ${(previewObra as any).municipio}` : ''}`.trim() || previewObra.rd || '-'}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ color: '#64748b' }}>Nombre del Solicitante:</strong>{' '}
                <div style={{ marginTop: '4px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {previewObra.nombreSolicitante || '-'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Coordenada X (Longitud):</strong> {previewObra.coordenadaX || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Coordenada Y (Latitud):</strong> {previewObra.coordenadaY || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Contrato:</strong> {previewObra.contrato || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Contratista:</strong> {previewObra.contratista || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Área de Zona:</strong> {(previewObra as any).area || '-'}
              </div>

              {/* Campos de retiro condicionales */}
              {((previewObra as any).atRetiro || (previewObra as any).ordenRetiro || (previewObra as any).siadRetiro) && (
                <>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Detalles de Retiro</strong>
                  </div>
                  <div>
                    <strong style={{ color: '#64748b' }}>AT de Retiro:</strong> {(previewObra as any).atRetiro || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#64748b' }}>SIAD de Retiro:</strong> {(previewObra as any).siadRetiro || '-'}
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong style={{ color: '#64748b' }}>Orden de Retiro:</strong> {(previewObra as any).ordenRetiro || '-'}
                  </div>
                </>
              )}

              {/* Fechas Clave */}
              <div style={{ gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Fechas Clave</strong>
              </div>
              {previewObra.tipoObra === 'APORTACIONES' ? (
                <>
                  <div>
                    <strong style={{ color: '#64748b' }}>Fecha de Pago:</strong> {(previewObra as any).fechaPago || '-'}
                  </div>
                  <div>
                    <strong style={{ color: '#64748b' }}>Días SSEEBRA:</strong> {(previewObra as any).diasObraAPORTACIONES || '-'}
                  </div>
                </>
              ) : (
                <div>
                  <strong style={{ color: '#64748b' }}>Fecha Programada:</strong> {(previewObra as any).fechaProgramada || '-'}
                </div>
              )}
              <div>
                <strong style={{ color: '#64748b' }}>Fecha de Autorización:</strong> {(previewObra as any).fechaAut || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Fecha de Supervisión:</strong> {(previewObra as any).fechaSupervision || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Fecha de Asignación:</strong> {previewObra.fechaAsignacion || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Fecha Término en Campo:</strong> {previewObra.fechaTerminoCampo || '-'}
              </div>
              <div>
                <strong style={{ color: '#64748b' }}>Fecha de Capitalización:</strong> {previewObra.fechaCapitalizacion || '-'}
              </div>

              {/* Documentos Adjuntos */}
              <div style={{ gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Planos y Archivos</strong>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                {(previewObra as any).planoPdf ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${(previewObra as any).planoPdf}`}
                    target="_blank"
                  >
                    Ver Plano PDF
                  </Button>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin plano cargado</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
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
            color="primary"
            variant="contained"
            style={{ backgroundColor: '#008E60' }}
          >
            Editar
          </Button>
          <Button onClick={() => setPreviewObra(null)} color="primary" variant="outlined" style={{ color: '#0f172a', borderColor: '#0f172a' }}>
            Cerrar
          </Button>
        </DialogActions>
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
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${editing.planoPdf}`}
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
    </div>
  );
}
