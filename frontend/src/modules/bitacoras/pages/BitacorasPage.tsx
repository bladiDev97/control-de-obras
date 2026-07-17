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
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import { obrasService } from '../../obras/services/obras.service';
import { Obra } from '../../obras/types/obra.types';

interface BitacoraData {
  id: number;
  titulo: string;
  encabezado: string;
  nota: string;
}

export default function BitacorasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [bitacoras, setBitacoras] = useState<BitacoraData[]>([]);

  // Metadata form states
  const [metadata, setMetadata] = useState({
    oficio: '',
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
    if (cleanStr.includes('-') && cleanStr.split('-')[0].length === 4) return cleanStr; // Already YYYY-MM-DD
    
    let parts = cleanStr.includes('-') ? cleanStr.split('-') : cleanStr.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) { // DD/MM/YYYY
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
      // Set form metadata (from any properties already saved in DB or fallback to other obra properties)
      setMetadata({
        oficio: (obra as any).oficio || obra.numeroOficio || '',
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
      // Refresh local list in case any metadata changed
      const updatedList = await obrasService.getAll();
      setObras(updatedList);
      // Reload sheets with new data
      await loadBitacoraSheets(selectedObraId);
    } catch (err) {
      console.error('Error al guardar datos de bitácora:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = (titulo: string, encabezado: string, nota: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const isSio = titulo.toUpperCase().includes('SIO');
      const labelText = isSio ? 'SIO :' : 'NOTA:';

      printWindow.document.write(`
        <html>
          <head>
            <title>${titulo}</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 40px;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                background-color: #fff;
              }
              .bitacora-table {
                width: 100%;
                max-width: 800px;
                border: 2px solid #000;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
              }
              .row {
                border-bottom: 2px solid #000;
                padding: 12px;
                font-size: 14px;
                box-sizing: border-box;
              }
              .row:last-child {
                border-bottom: none;
              }
              .header-row {
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
                background-color: #fff;
              }
              .label-row {
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                background-color: #fff;
              }
              .info-row {
                font-size: 16px;
                text-align: center;
                font-weight: bold;
                background-color: #fff;
              }
              .content-row {
                font-size: 16px;
                text-align: center;
                line-height: 1.8;
                padding: 40px 24px;
                min-height: 220px;
                display: flex;
                justify-content: center;
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

  return (
    <div>
      <h1 className="page-title">Generación de Bitácoras</h1>

      <Card sx={{ mb: 4 }} className="card">
        <CardContent sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-secondary)' }}>
            Selección y Configuración de Obra
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={obras}
                getOptionLabel={(o) => `${o.obra || 'S/N'} - AT: ${o.at || 'S/A'}`}
                value={selectedObra}
                onChange={(event, newValue) => {
                  handleSelectObra(newValue ? newValue.id : '');
                }}
                size="small"
                fullWidth
                renderInput={(params) => (
                  <TextField {...params} label="Seleccionar Obra" />
                )}
              />
            </Grid>

            {selectedObra && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 2, mt: 1, color: '#455a64' }}>
                    Parámetros para Generación de Plantillas
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
                    placeholder="Ej. Cable, Herrajes, Postes"
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
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={handleSaveMetadata}
                    disabled={saving}
                  >
                    {saving ? 'Generando...' : 'Generar'}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {selectedObraId && (
        <div>
          <Typography variant="h5" sx={{ mb: 3, mt: 4, fontWeight: 'bold', color: 'var(--color-primary)' }}>
            Formatos de Bitácora Generados ({bitacoras.length})
          </Typography>

          {loadingBitacoras ? (
            <Typography>Generando hojas de bitácoras...</Typography>
          ) : (
            <Grid container spacing={3}>
              {bitacoras.map((b) => {
                const isSio = b.titulo.toUpperCase().includes('SIO');
                const labelText = isSio ? 'SIO :' : 'NOTA:';

                return (
                  <Grid item xs={12} key={b.id}>
                    <Card
                      sx={{
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        mb: 2,
                      }}
                    >
                      <CardContent>
                        {/* Header bar of the preview card */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ color: '#78909c', fontSize: '0.85rem', fontWeight: 'bold' }}
                          >
                            FORMATO #{b.id}
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<PrintIcon />}
                            onClick={() => handlePrint(b.titulo, b.encabezado, b.nota)}
                          >
                            Imprimir
                          </Button>
                        </div>

                        {/* Miniature sheet replica preview */}
                        <div
                          style={{
                            border: '2px solid #000',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#fff',
                            fontFamily: 'Arial, sans-serif',
                          }}
                        >
                          <div
                            style={{
                              borderBottom: '2px solid #000',
                              padding: '10px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              fontSize: '1rem',
                              textTransform: 'uppercase',
                              backgroundColor: '#f5f5f5',
                            }}
                          >
                            {b.titulo}
                          </div>
                          <div
                            style={{
                              borderBottom: '2px solid #000',
                              padding: '6px 10px',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              color: '#555',
                            }}
                          >
                            TITULO :
                          </div>
                          <div
                            style={{
                              borderBottom: '2px solid #000',
                              padding: '8px 10px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              fontSize: '0.9rem',
                            }}
                          >
                            {b.encabezado}
                          </div>
                          <div
                            style={{
                              borderBottom: '2px solid #000',
                              padding: '6px 10px',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              color: '#555',
                            }}
                          >
                            {labelText}
                          </div>
                          <div
                            style={{
                              padding: '20px 16px',
                              fontSize: '0.95rem',
                              textAlign: 'justify',
                              lineHeight: '1.6',
                              whiteSpace: 'pre-line',
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
        </div>
      )}
    </div>
  );
}
