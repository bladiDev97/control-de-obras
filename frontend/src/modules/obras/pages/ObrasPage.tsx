import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, MenuItem, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useObras } from '../hooks/useObras';
import { obrasService, areasService } from '../services/obras.service';
import { contratosService } from '../../contratos/services/contratos.service';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import ReusableModal from '../../../components/Modal/ReusableModal';
import UploadPdf from '../../../components/UploadPdf/UploadPdf';
import { Obra } from '../types/obra.types';

// Declare global augmentation for the geo map window reference
declare global { interface Window { __geoMapWindow?: Window | null } }

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
      render: (row) => (
        <span
          onClick={() => setPreviewObra(row)}
          style={{
            color: '#1d4ed8',
            textDecoration: 'underline',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          {row.solicitudPo}
        </span>
      )
    },
    { key: 'at', label: 'AT' },
    { key: 'obra', label: 'Obra' },
    { key: 'anio', label: 'Año' },
    { key: 'tipoObra', label: 'Tipo de Obra' },
    { key: 'activo', label: 'Activo' },
    { key: 'orden', label: 'Orden' },
    {
      key: 'rd',
      label: 'RD',
      render: (row) => {
        const parts = [];
        if ((row as any).poblacion) parts.push((row as any).poblacion.toUpperCase());
        if ((row as any).municipio) parts.push(`MUNICIPIO DE ${(row as any).municipio.toUpperCase()}`);
        const text = parts.length > 0 ? parts.join(' ') : (row.rd || '');
        return (
          <div
            title={text}
            style={{
              maxWidth: '140px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.8rem',
              lineHeight: '1.2'
            }}
          >
            {text}
          </div>
        );
      }
    },
    {
      key: 'nombreSolicitante',
      label: 'Nombre',
      render: (row) => (
        <div
          title={row.nombreSolicitante || ''}
          style={{
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.8rem',
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
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: bg,
              color: fg,
              border: border,
              fontWeight: '800',
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'inline-block',
              cursor: isInteractive ? 'pointer' : 'default',
            }}
          >
            {displayLabel}
          </span>
        );
      },
    },

    {
      key: 'diasParaVencerse' as any,
      label: 'Días para Vencerse',
      render: (row: any) => typeof row.diasParaVencerse === 'number' ? row.diasParaVencerse : 0,
    },
    {
      key: 'dias' as any,
      label: 'Días',
      render: (row: any) => typeof row.dias === 'number' ? row.dias : 0,
    },
    {
      key: 'coordenadas' as any,
      label: 'Georeferencias',
      render: (row) => {
        const x = (row as any).coordenadaX || '';
        const y = (row as any).coordenadaY || '';
        if (!x && !y) return <span style={{ color: '#9ca3af' }}>-</span>;

        const handleOpenMap = (e: React.MouseEvent) => {
          e.stopPropagation();
          const url = `https://earth.google.com/web/search/${y},${x}`;
          console.log('[GEO] Click →', url);
          console.log('[GEO] __geoMapWindow:', window.__geoMapWindow, 'closed:', window.__geoMapWindow?.closed);

          // window.open('', 'name') returns existing window with that name
          // WITHOUT opening a new one. If no window with that name exists, opens blank.
          // Then we navigate it. This is the most reliable single-window approach.
          try {
            const w = window.open('', 'geo_obra_mapa');
            if (w) {
              if (w.location.href === 'about:blank' || w.location.href === '') {
                console.log('[GEO] Ventana nueva (blank) — navegando a Google Earth');
              } else {
                console.log('[GEO] Ventana existente encontrada — reutilizando');
              }
              w.location.href = url;
              w.focus();
              window.__geoMapWindow = w;
            }
          } catch (err) {
            console.warn('[GEO] Error, abriendo con _blank:', err);
            window.__geoMapWindow = window.open(url, 'geo_obra_mapa') || null;
          }
        };

        return (
          <span
            onClick={handleOpenMap}
            title="Ver en mapa"
            style={{
              fontSize: '0.70rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              color: '#1d4ed8',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
            }}
          >
            {y}, {x}
          </span>
        );
      }
    },


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
      const { tieneRetiro, contratista, ...payload } = editForm;
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

      await obrasService.update(cleanPayload as any);
      setEditing(null);
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
    if (!dateStr) return new Date(NaN);
    const cleanStr = dateStr.split(' ')[0].trim();
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const yyyy = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10) - 1;
        const dd = parseInt(parts[2], 10);
        return new Date(yyyy, mm, dd);
      }
    }
    return new Date(dateStr);
  };

  const calculateDiasParaVencerse = (row: Obra): number | string => {
    const tipo = (row.tipoObra || '').toUpperCase();
    const isAportaciones = tipo === 'APORTACIONES';
    
    if (isAportaciones) {
      if (!row.fechaPago) return '';
      try {
        const pagoDate = parseLocalDate(row.fechaPago);
        if (isNaN(pagoDate.getTime())) return '';
        const diasSseebra = row.diasObraAPORTACIONES || 9;
        const limitDate = new Date(pagoDate);
        limitDate.setDate(limitDate.getDate() + diasSseebra);
        limitDate.setHours(0, 0, 0, 0);
        const diffTime = limitDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return '';
      }
    } else {
      // RPT y FSU
      const rawFechaProg = (row as any).fechaProgramada;
      if (!rawFechaProg) return '';
      try {
        const progDate = parseLocalDate(rawFechaProg);
        if (isNaN(progDate.getTime())) return '';
        progDate.setHours(0, 0, 0, 0);
        const diffTime = progDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return '';
      }
    }
  };

  const calculateDias = (row: Obra): number | string => {
    const tipo = (row.tipoObra || '').toUpperCase();
    const isAportaciones = tipo === 'APORTACIONES';
    
    if (isAportaciones) {
      if (!row.fechaPago) return '';
      try {
        const pagoDate = parseLocalDate(row.fechaPago);
        if (isNaN(pagoDate.getTime())) return '';
        pagoDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - pagoDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return '';
      }
    } else {
      // RPT y FSU
      const rawFechaAsignacion = (row as any).fechaAsignacion;
      if (!rawFechaAsignacion) return '';
      try {
        const asigDate = parseLocalDate(rawFechaAsignacion);
        if (isNaN(asigDate.getTime())) return '';
        asigDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - asigDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return '';
      }
    }
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
        <ReusableTable columns={columns} rows={processedObras} />
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
              <MenuItem value="APORTACIONES">APORTACIONES</MenuItem>
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
                    href={`http://localhost:3000/${(previewObra as any).planoPdf}`}
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
                  fechaPago: (row as any).fechaPago || '',
                  fechaProgramada: (row as any).fechaProgramada || '',
                  fechaAut: (row as any).fechaAut || '',
                  fechaSupervision: (row as any).fechaSupervision || '',
                  fechaAsignacion: row.fechaAsignacion || '',
                  fechaTerminoCampo: row.fechaTerminoCampo || '',
                  fechaCapitalizacion: row.fechaCapitalizacion || '',
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
            gap: '16px',
            marginTop: '8px',
            maxHeight: '70vh',
            overflowY: 'auto',
            paddingRight: '8px',
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
              <MenuItem value="APORTACIONES">APORTACIONES</MenuItem>
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
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
              Fechas de Seguimiento
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
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
