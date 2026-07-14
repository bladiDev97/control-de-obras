import React, { useState, useRef } from 'react';
import {
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as XLSX from 'xlsx';
import { obrasService } from '../../obras/services/obras.service';

const recalculateSheetRange = (ws: any) => {
  const keys = Object.keys(ws || {}).filter(k => /^[A-Z]+\d+$/.test(k));
  if (keys.length === 0) return;

  const rows = keys.map(k => parseInt(k.replace(/^[A-Z]+/, ''), 10));
  const maxRow = Math.max(...rows);
  const minRow = Math.min(...rows);

  const colToNum = (col: string) => {
    let num = 0;
    for (let i = 0; i < col.length; i++) {
      num = num * 26 + (col.charCodeAt(i) - 64);
    }
    return num;
  };

  const numToCol = (num: number) => {
    let col = '';
    while (num > 0) {
      let rem = (num - 1) % 26;
      col = String.fromCharCode(65 + rem) + col;
      num = Math.floor((num - rem) / 26);
    }
    return col;
  };

  const cols = keys.map(k => k.replace(/\d+$/, ''));
  const colNumbers = cols.map(colToNum);
  const maxColNum = Math.max(...colNumbers);
  const minColNum = Math.min(...colNumbers);

  ws['!ref'] = `${numToCol(minColNum)}${minRow}:${numToCol(maxColNum)}${maxRow}`;
};

export default function ExcelImportPage() {
  // SIAD PLUS states
  const [rowsSiad, setRowsSiad] = useState<any[]>([]);
  const [fileNameSiad, setFileNameSiad] = useState<string>('');
  const [importingSiad, setImportingSiad] = useState(false);
  const [resultSiad, setResultSiad] = useState<{ success: boolean; count?: number; message?: string } | null>(null);
  const fileInputSiadRef = useRef<HTMLInputElement>(null);

  // SENASOL states
  const [rowsSenasol, setRowsSenasol] = useState<any[]>([]);
  const [fileNameSenasol, setFileNameSenasol] = useState<string>('');
  const [importingSenasol, setImportingSenasol] = useState(false);
  const [resultSenasol, setResultSenasol] = useState<{ success: boolean; count?: number; message?: string } | null>(null);
  const fileInputSenasolRef = useRef<HTMLInputElement>(null);

  // Shared preview state
  const [preview, setPreview] = useState<{ type: 'SIAD PLUS' | 'SENASOL'; rows: any[]; fileName: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'siad-plus' | 'senasol') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Recalculate range to bypass corrupted Excel dimension metadata
        recalculateSheetRange(ws);

        // Skip decorative header rows: SIAD PLUS headers start at row 4 (index 3), SENASOL headers start at row 2 (index 1)
        const rangeOption = type === 'siad-plus' ? { range: 3 } : { range: 1 };
        const data = XLSX.utils.sheet_to_json(ws, rangeOption);

        if (type === 'siad-plus') {
          // Filter to only include rows where Obra starts with E or A (case-insensitive column search)
          const filteredData = data.filter((row: any) => {
            const obraKey = Object.keys(row || {}).find(k => k.toLowerCase().trim() === 'obra');
            const obraVal = String(obraKey ? row[obraKey] : '').toUpperCase().trim();
            return obraVal.startsWith('E') || obraVal.startsWith('A');
          });

          setFileNameSiad(file.name);
          setRowsSiad(filteredData);
          setResultSiad(null);
          setPreview({ type: 'SIAD PLUS', rows: filteredData, fileName: file.name });
        } else {
          setFileNameSenasol(file.name);
          setRowsSenasol(data);
          setResultSenasol(null);
          setPreview({ type: 'SENASOL', rows: data, fileName: file.name });
        }
      } catch (err) {
        console.error('Error al procesar el archivo Excel:', err);
        const errMsg = 'No se pudo leer el archivo Excel. Asegúrese de que sea un formato válido (.xlsx o .xls).';
        if (type === 'siad-plus') {
          setResultSiad({ success: false, message: errMsg });
        } else {
          setResultSenasol({ success: false, message: errMsg });
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleClear = (type: 'siad-plus' | 'senasol') => {
    if (type === 'siad-plus') {
      setRowsSiad([]);
      setFileNameSiad('');
      setResultSiad(null);
      if (fileInputSiadRef.current) fileInputSiadRef.current.value = '';
    } else {
      setRowsSenasol([]);
      setFileNameSenasol('');
      setResultSenasol(null);
      if (fileInputSenasolRef.current) fileInputSenasolRef.current.value = '';
    }

    if (preview && preview.type === (type === 'siad-plus' ? 'SIAD PLUS' : 'SENASOL')) {
      setPreview(null);
    }
  };

  const handleImport = async (type: 'siad-plus' | 'senasol') => {
    const targetRows = type === 'siad-plus' ? rowsSiad : rowsSenasol;
    if (targetRows.length === 0) return;

    if (type === 'siad-plus') {
      setImportingSiad(true);
      setResultSiad(null);
    } else {
      setImportingSenasol(true);
      setResultSenasol(null);
    }

    try {
      const res = await obrasService.importar(targetRows, type);
      const successMsg = `¡Importación exitosa! Se procesaron y cargaron ${res.count} registros del archivo ${type.toUpperCase()} en la base de datos.`;

      if (type === 'siad-plus') {
        setResultSiad({ success: true, count: res.count, message: successMsg });
        setRowsSiad([]);
        setFileNameSiad('');
      } else {
        setResultSenasol({ success: true, count: res.count, message: successMsg });
        setRowsSenasol([]);
        setFileNameSenasol('');
      }
      setPreview(null);
    } catch (err) {
      console.error('Error al importar en el servidor:', err);
      const errMsg = 'Ocurrió un error al enviar los datos al servidor. Por favor, intente de nuevo.';
      if (type === 'siad-plus') {
        setResultSiad({ success: false, message: errMsg });
      } else {
        setResultSenasol({ success: false, message: errMsg });
      }
    } finally {
      if (type === 'siad-plus') {
        setImportingSiad(false);
      } else {
        setImportingSenasol(false);
      }
    }
  };

  return (
    <div>
      <h1 className="page-title">
        <span>⚡ Importación Masiva de Solicitudes (Excel)</span>
      </h1>

      <Grid container spacing={3}>
        {/* Column 1: SIAD PLUS */}
        <Grid item xs={12} md={6}>
          <Card className="card" sx={{ height: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: '850', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📁 Reporte SIAD PLUS
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ minHeight: '44px' }}>
                  Carga general de obras principales. Lee columnas obligatorias como Solicitud/PO, Año, AT, Tipo de Obra, etc., y crea las obras en el sistema.
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  border: '2px dashed #008E60',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f0fdf4',
                    borderColor: '#005f40',
                  },
                  mb: 3,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => fileInputSiadRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputSiadRef}
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, 'siad-plus')}
                />
                <CloudUploadIcon sx={{ fontSize: 44, color: '#008E60', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 'bold' }} gutterBottom>
                  {fileNameSiad ? fileNameSiad : 'Selecciona o arrastra archivo SIAD PLUS aquí'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Formatos: .xlsx, .xls
                </Typography>
              </Box>

              {resultSiad && (
                <Alert
                  severity={resultSiad.success ? 'success' : 'error'}
                  icon={resultSiad.success ? <CheckCircleOutlineIcon /> : undefined}
                  sx={{ mb: 3, borderRadius: '8px', fontWeight: '500' }}
                >
                  {resultSiad.message}
                </Alert>
              )}

              {rowsSiad.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleImport('siad-plus')}
                    disabled={importingSiad}
                    sx={{
                      backgroundColor: '#008E60',
                      '&:hover': { backgroundColor: '#006e4a' },
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '8px',
                    }}
                    startIcon={<PlayArrowIcon />}
                  >
                    {importingSiad ? 'Procesando...' : `Importar SIAD PLUS (${rowsSiad.length})`}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ClearIcon />}
                    onClick={() => handleClear('siad-plus')}
                    disabled={importingSiad}
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Column 2: SENASOL */}
        <Grid item xs={12} md={6}>
          <Card className="card" sx={{ height: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: '850', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Reporte SENASOL
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ minHeight: '44px' }}>
                  Actualización de pagos y días de obra. Asigna Días SSEEBRA (Nuevo = 28 días, en blanco = 9 días) y la Fecha de Pago desde la columna "RECIBIO PAGO".
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  border: '2px dashed #008E60',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f0fdf4',
                    borderColor: '#005f40',
                  },
                  mb: 3,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => fileInputSenasolRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputSenasolRef}
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, 'senasol')}
                />
                <CloudUploadIcon sx={{ fontSize: 44, color: '#008E60', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 'bold' }} gutterBottom>
                  {fileNameSenasol ? fileNameSenasol : 'Selecciona o arrastra archivo SENASOL aquí'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Formatos: .xlsx, .xls
                </Typography>
              </Box>

              {resultSenasol && (
                <Alert
                  severity={resultSenasol.success ? 'success' : 'error'}
                  icon={resultSenasol.success ? <CheckCircleOutlineIcon /> : undefined}
                  sx={{ mb: 3, borderRadius: '8px', fontWeight: '500' }}
                >
                  {resultSenasol.message}
                </Alert>
              )}

              {rowsSenasol.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleImport('senasol')}
                    disabled={importingSenasol}
                    sx={{
                      backgroundColor: '#008E60',
                      '&:hover': { backgroundColor: '#006e4a' },
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '8px',
                    }}
                    startIcon={<PlayArrowIcon />}
                  >
                    {importingSenasol ? 'Procesando...' : `Importar SENASOL (${rowsSenasol.length})`}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ClearIcon />}
                    onClick={() => handleClear('senasol')}
                    disabled={importingSenasol}
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shared Preview Section */}
      {preview && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-secondary)', fontWeight: 'bold' }}>
            Vista Previa de los Datos (Primeras 10 Filas de {preview.type}): {preview.fileName}
          </Typography>
          {preview.rows.length === 0 ? (
            <Alert severity="warning" sx={{ borderRadius: '8px', fontWeight: '500' }}>
              No se encontraron registros válidos para importar en este archivo (recuerda que en SIAD PLUS solo se importan las obras cuyo identificador en el campo "Obra" inicie con las letras "E" o "A").
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {Object.keys(preview.rows[0] || {}).map((h, idx) => (
                      <TableCell key={idx} sx={{ backgroundColor: 'var(--verde-cfe)', color: '#fff', fontWeight: '800' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.rows.slice(0, 10).map((row, rowIdx) => (
                    <TableRow key={rowIdx} hover>
                      {Object.keys(preview.rows[0] || {}).map((h, colIdx) => (
                        <TableCell key={colIdx} sx={{ fontSize: '0.85rem' }}>{String(row[h] ?? '')}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </div>
  );
}
