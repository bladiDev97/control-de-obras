import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Autocomplete,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LayersIcon from '@mui/icons-material/Layers';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { obrasService } from '../../obras/services/obras.service';
import { Obra } from '../../obras/types/obra.types';

interface BitacoraData {
  id: number;
  titulo: string;
  encabezado: string;
  nota: string;
}

const FORMAT_NAMES: Record<number, string> = {
  1: 'Entrega del Sitio de los Trabajos (Supervisor)',
  2: 'Autorización de Estimación (Residente de Obra)',
  3: 'Entrega de Materiales por Salida Económica',
  4: 'Supervisión de Obra (Supervisor)',
  5: 'SIO - Autorización de Pago de Estimación',
};

export default function BitacorasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [bitacoras, setBitacoras] = useState<BitacoraData[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Metadata form states
  const [metadata, setMetadata] = useState({
    fechaAut: '',
    materialesSalida: '',
    fechaSupervision: '',
  });

  const [saving, setSaving] = useState(false);
  const [loadingBitacoras, setLoadingBitacoras] = useState(false);

  useEffect(() => {
    const loadObras = async () => {
      try {
        const data = await obrasService.getAll();
        setObras(data);
      } catch (err) {
        console.error('Error cargando obras para bitácoras:', err);
      }
    };
    loadObras();
  }, []);

  // Helper to format any date string (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) to YYYY-MM-DD for date inputs
  const formatToInputDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const cleanStr = dateStr.split(' ')[0].trim();
    if (cleanStr.includes('-') && cleanStr.split('-')[0].length === 4) return cleanStr;
    
    let parts = cleanStr.includes('-') ? cleanStr.split('-') : cleanStr.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return '';
  };

  const handleSelectObra = async (id: string) => {
    setSelectedObraId(id);
    const obra = obras.find((o) => o.id === id) || null;
    setSelectedObra(obra);

    if (obra) {
      setMetadata({
        fechaAut: (obra as any).fechaAut || formatToInputDate(obra.fechaAsignacion) || '',
        materialesSalida: (obra as any).materialesSalida || 'S/A',
        fechaSupervision: (obra as any).fechaSupervision || formatToInputDate(obra.fechaFinConstruccion) || '',
      });
      loadBitacoraSheets(id);
    } else {
      setBitacoras([]);
    }
  };

  const loadBitacoraSheets = async (obraId: string) => {
    setLoadingBitacoras(true);
    try {
      const sheets = await obrasService.getBitacoras(obraId);
      setBitacoras(sheets);
    } catch (err) {
      console.error('Error al cargar hojas de bitácora:', err);
    } finally {
      setLoadingBitacoras(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!selectedObraId) return;
    setSaving(true);
    try {
      await obrasService.update({
        solicitudPo: selectedObraId,
        ...metadata,
      });
      const updatedList = await obrasService.getAll();
      setObras(updatedList);
      await loadBitacoraSheets(selectedObraId);
    } catch (err) {
      console.error('Error al guardar datos de bitácora:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyNota = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (!bitacoras || bitacoras.length === 0) return;
    const fullText = bitacoras.map((b) => `=== FORMATO #${b.id}: ${b.titulo} ===\n${b.encabezado}\n\n${b.nota}\n`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrint = (titulo: string, encabezado: string, nota: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const isSio = titulo.trim().toUpperCase() === 'SIO' || titulo.trim().toUpperCase().startsWith('SIO ');
      const labelText = isSio ? 'SIO :' : 'NOTA:';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${titulo}</title>
            <meta charset="utf-8" />
            <style>
              @page {
                size: letter;
                margin: 20mm;
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 24px;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                background-color: #fff;
                color: #000;
              }
              .bitacora-table {
                width: 100%;
                max-width: 820px;
                border: 2px solid #000;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
              }
              .row {
                border-bottom: 2px solid #000;
                padding: 10px 14px;
                box-sizing: border-box;
              }
              .row:last-child {
                border-bottom: none;
              }
              .header-row {
                font-size: 15px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
                background-color: #fff;
                letter-spacing: 0.5px;
              }
              .label-row {
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                background-color: #fff;
                padding: 6px 14px;
              }
              .info-row {
                font-size: 13px;
                text-align: center;
                font-weight: bold;
                background-color: #fff;
                padding: 10px 14px;
                line-height: 1.4;
              }
              .content-row {
                font-size: 14.5px;
                line-height: 1.85;
                padding: 36px 28px;
                min-height: 200px;
                display: flex;
                align-items: center;
                text-align: justify;
                white-space: pre-line;
              }
              @media print {
                body {
                  padding: 0;
                }
                .bitacora-table {
                  width: 100%;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="bitacora-table">
              <div class="row header-row">${titulo}</div>
              <div class="row label-row">TITULO :</div>
              <div class="row info-row">${encabezado}</div>
              <div class="row label-row">${labelText}</div>
              <div class="row content-row">${nota}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintAll = () => {
    if (!bitacoras || bitacoras.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const sheetsHtml = bitacoras.map((b, idx) => {
        const isSio = b.id === 5 || b.titulo.trim().toUpperCase() === 'SIO';
        const labelText = isSio ? 'SIO :' : 'NOTA:';
        const isLast = idx === bitacoras.length - 1;
        return `
          <div class="page-container ${isLast ? '' : 'page-break'}">
            <div class="bitacora-table">
              <div class="row header-row">${b.titulo}</div>
              <div class="row label-row">TITULO :</div>
              <div class="row info-row">${b.encabezado}</div>
              <div class="row label-row">${labelText}</div>
              <div class="row content-row">${b.nota}</div>
            </div>
          </div>
        `;
      }).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bitácoras - ${selectedObra?.obra || 'Obra'}</title>
            <meta charset="utf-8" />
            <style>
              @page {
                size: letter;
                margin: 20mm;
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 24px;
                background-color: #fff;
                color: #000;
              }
              .page-container {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                margin-bottom: 40px;
              }
              .page-break {
                page-break-after: always;
                break-after: page;
              }
              .bitacora-table {
                width: 100%;
                max-width: 820px;
                border: 2px solid #000;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
              }
              .row {
                border-bottom: 2px solid #000;
                padding: 10px 14px;
                box-sizing: border-box;
              }
              .row:last-child {
                border-bottom: none;
              }
              .header-row {
                font-size: 15px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
                background-color: #fff;
                letter-spacing: 0.5px;
              }
              .label-row {
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                background-color: #fff;
                padding: 6px 14px;
              }
              .info-row {
                font-size: 13px;
                text-align: center;
                font-weight: bold;
                background-color: #fff;
                padding: 10px 14px;
                line-height: 1.4;
              }
              .content-row {
                font-size: 14.5px;
                line-height: 1.85;
                padding: 36px 28px;
                min-height: 200px;
                display: flex;
                align-items: center;
                text-align: justify;
                white-space: pre-line;
              }
              @media print {
                body {
                  padding: 0;
                }
                .page-container {
                  margin-bottom: 0;
                }
                .bitacora-table {
                  width: 100%;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            ${sheetsHtml}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Box sx={{ maxWidth: 1180, margin: '0 auto', pb: 10, pt: 1.5 }}>
      {/* Top Header */}
      <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 142, 96, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--verde-cfe, #008E60)',
            }}
          >
            <DescriptionIcon sx={{ fontSize: 26 }} />
          </Box>
          <div>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'var(--color-text-dark, #111827)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Bitácoras Oficiales de Obra
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-light, #6b7280)', mt: 0.3 }}>
              Generación de formatos reglamentarios CFE con sincronización automática de estimaciones
            </Typography>
          </div>
        </Box>
      </Box>

      {/* Obra Configuration Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 'var(--radius-base, 14px)',
          boxShadow: 'var(--shadow-premium)',
          border: '1px solid var(--color-border, #e2e1d7)',
          backgroundColor: '#ffffff',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Autocomplete
                options={obras}
                getOptionLabel={(o) => `${o.obra || 'S/N'} - AT: ${o.at || 'S/A'}${o.contrato ? ` (${o.contrato})` : ''}`}
                value={selectedObra}
                onChange={(_, newValue) => {
                  handleSelectObra(newValue ? newValue.id : '');
                }}
                size="small"
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar Obra"
                    placeholder="Buscar por clave de obra, AT o contrato..."
                  />
                )}
              />
            </Grid>

            {selectedObra && (
              <>
                {/* Obra Summary Strip */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      p: '12px 18px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Chip
                      label={`OBRA: ${selectedObra.obra || 'S/N'}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: 'rgba(0, 142, 96, 0.1)',
                        color: 'var(--verde-cfe, #008E60)',
                        border: '1px solid rgba(0, 142, 96, 0.25)',
                      }}
                    />
                    <Chip
                      label={`AT: ${selectedObra.at || 'S/A'}`}
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
                    />
                    <Chip
                      label={`CONTRATO: ${selectedObra.contrato || '9400120159'}`}
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
                    />
                    {selectedObra.activo && selectedObra.activo !== '0' && (
                      <Chip
                        label={`ACTIVO: ${selectedObra.activo}`}
                        size="small"
                        sx={{ fontWeight: 600, bgcolor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
                      />
                    )}
                    {selectedObra.orden && selectedObra.orden !== '0' && (
                      <Chip
                        label={`ORDEN: ${selectedObra.orden}`}
                        size="small"
                        sx={{ fontWeight: 600, bgcolor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
                      />
                    )}

                    {Array.isArray(selectedObra.estimaciones) && selectedObra.estimaciones.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, ml: 'auto' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803d' }}>
                          Estimaciones sincronizadas ({selectedObra.estimaciones.length})
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Parámetros de Fechas y Materiales
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Fecha de Autorización"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={metadata.fechaAut}
                    onChange={(e) => setMetadata({ ...metadata, fechaAut: e.target.value })}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Fecha de Supervisión"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={metadata.fechaSupervision}
                    onChange={(e) =>
                      setMetadata({ ...metadata, fechaSupervision: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Materiales de Salida"
                    size="small"
                    placeholder="Ej. S/A o 1 PZ DE BASTIDOR B4"
                    value={metadata.materialesSalida}
                    onChange={(e) =>
                      setMetadata({ ...metadata, materialesSalida: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveMetadata}
                    disabled={saving}
                    sx={{
                      bgcolor: 'var(--verde-cfe, #008E60)',
                      '&:hover': { bgcolor: '#007650' },
                      px: 3.5,
                      py: 1,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0, 142, 96, 0.25)',
                    }}
                  >
                    {saving ? 'Guardando y Generando...' : 'Generar Bitácoras'}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Generated Bitacoras Section */}
      {selectedObraId ? (
        <Box>
          {/* Section Header */}
          <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--verde-cfe, #008E60)', letterSpacing: '-0.01em' }}>
                Formatos de Bitácora Generados ({bitacoras.length})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Plantillas oficiales CFE listas para revisión y firma
              </Typography>
            </Box>

            {bitacoras.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Tooltip title="Copiar el texto completo de todos los 5 formatos">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={copiedAll ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={handleCopyAll}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '8px',
                      borderColor: copiedAll ? '#86efac' : '#cbd5e1',
                      color: copiedAll ? '#16a34a' : '#475569',
                      bgcolor: copiedAll ? '#f0fdf4' : '#ffffff',
                      px: 2,
                    }}
                  >
                    {copiedAll ? '¡Todo Copiado!' : 'Copiar Todas las Notas'}
                  </Button>
                </Tooltip>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<LayersIcon />}
                  onClick={handlePrintAll}
                  sx={{
                    bgcolor: 'var(--verde-cfe, #008E60)',
                    '&:hover': { bgcolor: '#007650' },
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 2.5,
                    boxShadow: '0 2px 6px rgba(0, 142, 96, 0.25)',
                  }}
                >
                  Imprimir Todo ({bitacoras.length} Hojas)
                </Button>
              </Box>
            )}
          </Box>

          {loadingBitacoras ? (
            <Card sx={{ p: 5, textAlign: 'center', borderRadius: 'var(--radius-base, 14px)', border: '1px solid var(--color-border, #e2e1d7)' }}>
              <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Cargando hojas de bitácoras oficiales...</Typography>
            </Card>
          ) : (
            <Grid container spacing={3.5}>
              {bitacoras.map((b) => {
                const isSio = b.id === 5 || b.titulo.trim().toUpperCase() === 'SIO';
                const labelText = isSio ? 'SIO :' : 'NOTA:';
                const isCopied = copiedId === b.id;
                const formatSubName = FORMAT_NAMES[b.id] || '';

                return (
                  <Grid item xs={12} key={b.id}>
                    <Card
                      sx={{
                        borderRadius: 'var(--radius-base, 14px)',
                        boxShadow: 'var(--shadow-premium)',
                        border: '1px solid var(--color-border, #e2e1d7)',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top Bar of Card */}
                      <Box
                        sx={{
                          px: 3,
                          py: 1.8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          borderBottom: '1px solid #f1f5f9',
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Chip
                            label={`FORMATO #${b.id}`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: 'rgba(0, 142, 96, 0.1)',
                              color: 'var(--verde-cfe, #008E60)',
                              border: '1px solid rgba(0, 142, 96, 0.25)',
                              fontSize: '0.75rem',
                              letterSpacing: '0.4px',
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{ color: '#334155', fontWeight: 700, fontSize: '0.88rem' }}
                          >
                            {formatSubName}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Tooltip title="Copiar texto de la nota al portapapeles">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={isCopied ? <CheckIcon /> : <ContentCopyIcon />}
                              onClick={() => handleCopyNota(b.nota, b.id)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                borderRadius: '7px',
                                color: isCopied ? '#16a34a' : '#475569',
                                borderColor: isCopied ? '#86efac' : '#cbd5e1',
                                bgcolor: isCopied ? '#f0fdf4' : '#ffffff',
                                '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                              }}
                            >
                              {isCopied ? '¡Copiado!' : 'Copiar Nota'}
                            </Button>
                          </Tooltip>

                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PrintIcon />}
                            onClick={() => handlePrint(b.titulo, b.encabezado, b.nota)}
                            sx={{
                              bgcolor: 'var(--verde-cfe, #008E60)',
                              '&:hover': { bgcolor: '#007650' },
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              px: 2.2,
                              borderRadius: '7px',
                              boxShadow: 'none',
                            }}
                          >
                            Imprimir
                          </Button>
                        </Box>
                      </Box>

                      {/* Official CFE Sheet Preview */}
                      <CardContent sx={{ p: { xs: 2, sm: 3 }, pt: 2, bgcolor: '#ffffff' }}>
                        <div
                          style={{
                            border: '2px solid #000000',
                            backgroundColor: '#ffffff',
                            width: '100%',
                            boxSizing: 'border-box',
                            fontFamily: 'Arial, Helvetica, sans-serif',
                          }}
                        >
                          <div
                            style={{
                              borderBottom: '2px solid #000000',
                              padding: '12px 16px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              fontSize: '15px',
                              textTransform: 'uppercase',
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              letterSpacing: '0.4px',
                            }}
                          >
                            {b.titulo}
                          </div>
                          <div
                            style={{
                              borderBottom: '1.5px solid #000000',
                              padding: '7px 14px',
                              fontWeight: 'bold',
                              fontSize: '13px',
                              color: '#000000',
                              backgroundColor: '#ffffff',
                            }}
                          >
                            TITULO :
                          </div>
                          <div
                            style={{
                              borderBottom: '2px solid #000000',
                              padding: '11px 16px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              fontSize: '13.5px',
                              color: '#000000',
                              backgroundColor: '#ffffff',
                              lineHeight: '1.45',
                            }}
                          >
                            {b.encabezado}
                          </div>
                          <div
                            style={{
                              borderBottom: '1.5px solid #000000',
                              padding: '7px 14px',
                              fontWeight: 'bold',
                              fontSize: '13px',
                              color: '#000000',
                              backgroundColor: '#ffffff',
                            }}
                          >
                            {labelText}
                          </div>
                          <div
                            style={{
                              padding: '30px 24px',
                              fontSize: '14.5px',
                              textAlign: 'justify',
                              lineHeight: '1.9',
                              whiteSpace: 'pre-line',
                              color: '#000000',
                              backgroundColor: '#ffffff',
                            }}
                          >
                            {b.nota}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      ) : (
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 'var(--radius-base, 14px)',
            border: '1px dashed #d6d3d1',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <Typography variant="body1" sx={{ color: '#78716c', fontWeight: 600 }}>
            Seleccione una obra en el buscador superior para generar sus 5 formatos de bitácora oficiales.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
