import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TextField,
  TableSortLabel,
  InputAdornment,
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  width?: string;
}

export interface ReusableTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  searchable?: boolean;
  defaultOrderBy?: keyof T;
  defaultOrderDir?: 'asc' | 'desc';
  customSort?: (a: T, b: T) => number;
}

export default function ReusableTable<T extends Record<string, any>>({
  columns,
  rows,
  searchable = true,
  defaultOrderBy,
  defaultOrderDir,
  customSort,
}: ReusableTableProps<T>) {
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<keyof T | null>(defaultOrderBy || null);
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>(defaultOrderDir || 'asc');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Show/Hide Días columns state
  const [showDias, setShowDias] = useState<boolean>(true);

  // Multi-color filter state
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Auto-scroll table container to bottom on load so smaller-day items are displayed first
  useEffect(() => {
    if (tableContainerRef.current && rows.length > 0) {
      const timer = setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [rows.length]);

  // Check available filterable columns dynamically
  const hasStatusColumn = rows.length > 0 && 'estatus' in rows[0];
  const hasTipoObraColumn = rows.length > 0 && 'tipoObra' in rows[0];
  const hasAnioColumn = rows.length > 0 && 'anio' in rows[0];

  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [tipoObraFilter, setTipoObraFilter] = useState<string>('TODOS');
  const [anioFilter, setAnioFilter] = useState<string>('TODOS');

  // Helper to identify Días columns
  const isDiasColumn = (col: Column<T>) => {
    const keyStr = String(col.key).toLowerCase();
    const labelStr = String(col.label || '').toLowerCase();
    return (
      keyStr.includes('dias') ||
      labelStr.includes('días') ||
      labelStr.includes('dias') ||
      labelStr.includes('vencer')
    );
  };

  const visibleColumns = React.useMemo(() => {
    if (showDias) return columns;
    return columns.filter((col) => !isDiasColumn(col));
  }, [columns, showDias]);

  const hasDiasColumn = React.useMemo(() => {
    return columns.some((col) => isDiasColumn(col));
  }, [columns]);

  // Helper to classify row color(s)
  const getRowColors = (row: any): string[] => {
    const colors: string[] = [];
    const hasFechaTerminoCampo = !!(row.fechaTerminoCampo && String(row.fechaTerminoCampo).trim() !== '');
    const hasFechaTerminoConstruccion = !!(
      (row.fechaFinConstruccion && String(row.fechaFinConstruccion).trim() !== '') ||
      (row.fechaTermino && String(row.fechaTermino).trim() !== '')
    );

    // 1. Row background class logic
    if (row.estatus === 'CAPITALIZADA') {
      if (!hasFechaTerminoCampo) {
        colors.push('ROJO'); // CAPITALIZAR (Anomalía)
      } else {
        colors.push('VERDE'); // INVENTARIO
      }
    } else if (hasFechaTerminoCampo || hasFechaTerminoConstruccion || row.estatus === 'TERMINADA') {
      colors.push('AZUL'); // CONCILIAR
    } else {
      colors.push('AZUL'); // CONCILIAR
    }

    // 2. POR VENCER badge colors
    if (
      typeof row.diasParaVencerse === 'number' &&
      !hasFechaTerminoCampo &&
      row.estatus !== 'CAPITALIZADA' &&
      row.estatus !== 'TERMINADA'
    ) {
      const days = row.diasParaVencerse;
      if (days >= 0 && days <= 3) {
        if (!colors.includes('ROJO')) colors.push('ROJO');
      } else {
        if (!colors.includes('AZUL')) colors.push('AZUL');
      }
    }

    // 3. diasSinCapitalizar badge colors
    if (typeof row.diasSinCapitalizar === 'number') {
      const d = row.diasSinCapitalizar;
      if (d >= 17) {
        if (!colors.includes('ROJO')) colors.push('ROJO');
      } else {
        if (!colors.includes('VERDE')) colors.push('VERDE');
      }
    }

    return colors;
  };

  // Compute unique values for dropdowns
  const tipoObraOptions = React.useMemo(() => {
    if (!hasTipoObraColumn) return [];
    return Array.from(
      new Set(rows.map((r) => String(r.tipoObra || '').toUpperCase().trim()).filter(Boolean))
    ).sort();
  }, [rows, hasTipoObraColumn]);

  const anioOptions = React.useMemo(() => {
    if (!hasAnioColumn) return [];
    return Array.from(
      new Set(rows.map((r) => String(r.anio || '').trim()).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));
  }, [rows, hasAnioColumn]);

  // Apply filters
  const filtered = rows.filter((row) => {
    // 1. Status Filter
    if (hasStatusColumn && statusFilter !== 'TODOS') {
      if (row.estatus !== statusFilter) return false;
    }
    // 2. Tipo Obra Filter
    if (hasTipoObraColumn && tipoObraFilter !== 'TODOS') {
      if (String(row.tipoObra || '').toUpperCase().trim() !== tipoObraFilter) return false;
    }
    // 3. Anio Filter
    if (hasAnioColumn && anioFilter !== 'TODOS') {
      if (String(row.anio || '').trim() !== anioFilter) return false;
    }
    // 4. Color Filter
    if (selectedColors.length > 0 && !selectedColors.includes('TODOS')) {
      const rowColors = getRowColors(row);
      const matches = selectedColors.some((c) => rowColors.includes(c));
      if (!matches) return false;
    }
    // 5. Search Text Filter
    return visibleColumns.some((col) =>
      String(row[col.key] ?? '')
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  });

  // Apply sorting (use orderBy if user clicked a header, or customSort if provided)
  const sorted = orderBy
    ? [...filtered].sort((a, b) => {
        const av = a[orderBy];
        const bv = b[orderBy];
        if (av < bv) return orderDir === 'asc' ? -1 : 1;
        if (av > bv) return orderDir === 'asc' ? 1 : -1;
        return 0;
      })
    : customSort
    ? [...filtered].sort(customSort)
    : filtered;

  const handleSort = (key: keyof T) => {
    if (orderBy === key) {
      setOrderDir(orderDir === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(key);
      setOrderDir('asc');
    }
  };

  return (
    <Paper className="card" sx={{ p: { xs: 1.5, sm: 2.5 }, width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Toolbar: Search input + Multi-Dropdown Filters (Responsive Layout) */}
      {(searchable || hasStatusColumn || hasTipoObraColumn || hasAnioColumn || hasDiasColumn) && (
        <Box
          sx={{
            display: 'flex',
            justify: 'space-between',
            gap: { xs: 1.5, sm: 2 },
            mb: 2.5,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          {searchable && (
            <Box sx={{ flex: '1 1 200px' }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Buscar registros..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'var(--color-text-light)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { xs: '100%', md: 260 } }}
              />
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              flexWrap: 'wrap',
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {hasStatusColumn && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  Estatus:
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    height: 36,
                    minWidth: { xs: 95, sm: 120 },
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem' }}>TODOS</MenuItem>
                  <MenuItem value="PENDIENTE" sx={{ fontSize: '0.8rem' }}>ASIGNAR</MenuItem>
                  <MenuItem value="ASIGNADA" sx={{ fontSize: '0.8rem' }}>PROCESO</MenuItem>
                  <MenuItem value="TERMINADA" sx={{ fontSize: '0.8rem' }}>TERMINADA</MenuItem>
                  <MenuItem value="CAPITALIZADA" sx={{ fontSize: '0.8rem' }}>CAPITALIZADA</MenuItem>
                </Select>
              </Box>
            )}

            {hasTipoObraColumn && tipoObraOptions.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  Tipo:
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={tipoObraFilter}
                  onChange={(e) => setTipoObraFilter(e.target.value)}
                  sx={{
                    height: 36,
                    minWidth: { xs: 85, sm: 105 },
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem' }}>TODOS</MenuItem>
                  {tipoObraOptions.map((opt) => (
                    <MenuItem key={opt} value={opt} sx={{ fontSize: '0.8rem' }}>{opt}</MenuItem>
                  ))}
                </Select>
              </Box>
            )}

            {hasAnioColumn && anioOptions.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  Año:
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={anioFilter}
                  onChange={(e) => setAnioFilter(e.target.value)}
                  sx={{
                    height: 36,
                    minWidth: { xs: 75, sm: 90 },
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem' }}>TODOS</MenuItem>
                  {anioOptions.map((opt) => (
                    <MenuItem key={opt} value={opt} sx={{ fontSize: '0.8rem' }}>{opt}</MenuItem>
                  ))}
                </Select>
              </Box>
            )}

            {/* Color Filter Dropdown: VERDES (INVENTARIO), ROJAS (CAPITALIZAR), AZULES (CONCILIAR) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
              <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                Color:
              </Typography>
              <Select
                multiple
                size="small"
                fullWidth
                value={selectedColors.length === 0 ? ['TODOS'] : selectedColors}
                onChange={(e) => {
                  const val = typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]);
                  if (val.includes('TODOS') && !selectedColors.includes('TODOS') && val.length > 1) {
                    setSelectedColors(['TODOS']);
                  } else {
                    const clean = val.filter((v) => v !== 'TODOS');
                    setSelectedColors(clean.length === 0 ? ['TODOS'] : clean);
                  }
                }}
                renderValue={(selected) => {
                  if (selected.includes('TODOS') || selected.length === 0) return 'TODOS';
                  return selected.map(c => {
                    if (c === 'VERDE') return '🟢 VERDE (INVENTARIO)';
                    if (c === 'ROJO') return '🔴 ROJO (CAPITALIZAR)';
                    if (c === 'AZUL') return '🔵 AZUL (CONCILIAR)';
                    return c;
                  }).join(', ');
                }}
                sx={{
                  height: 36,
                  minWidth: { xs: 110, sm: 155 },
                  maxWidth: { xs: 180, sm: 240 },
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                <MenuItem value="TODOS" sx={{ fontSize: '0.8rem', fontWeight: selectedColors.includes('TODOS') || selectedColors.length === 0 ? 800 : 400 }}>
                  TODOS
                </MenuItem>
                <MenuItem value="VERDE" sx={{ fontSize: '0.8rem', color: '#15803d', fontWeight: selectedColors.includes('VERDE') ? 800 : 400 }}>
                  🟢 VERDE (INVENTARIO)
                </MenuItem>
                <MenuItem value="ROJO" sx={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: selectedColors.includes('ROJO') ? 800 : 400 }}>
                  🔴 ROJO (CAPITALIZAR)
                </MenuItem>
                <MenuItem value="AZUL" sx={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: selectedColors.includes('AZUL') ? 800 : 400 }}>
                  🔵 AZUL (CONCILIAR)
                </MenuItem>
              </Select>
            </Box>

            {/* Ultra-discreet button to toggle showing/hiding Días columns */}
            {hasDiasColumn && (
              <Button
                size="small"
                variant="text"
                onClick={() => setShowDias(!showDias)}
                startIcon={showDias ? <VisibilityIcon sx={{ fontSize: '0.8rem !important', opacity: 0.5 }} /> : <VisibilityOffIcon sx={{ fontSize: '0.8rem !important', opacity: 0.3 }} />}
                sx={{
                  height: 26,
                  px: 0.8,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  color: '#64748b !important',
                  backgroundColor: 'transparent !important',
                  border: 'none !important',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: '#f1f5f9 !important',
                    color: '#1e293b !important',
                  },
                }}
              >
                {showDias ? 'Días: SÍ' : 'Días: NO'}
              </Button>
            )}
          </Box>
        </Box>
      )}

      <TableContainer
        ref={tableContainerRef}
        sx={{
          width: '100%',
          maxHeight: { xs: 'calc(100vh - 280px)', sm: 'calc(100vh - 220px)' },
          overflowY: 'auto',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: { xs: '980px', md: '100%' },
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  align="center"
                  sx={{
                    width: (col as any).width || 'auto',
                    fontWeight: '800',
                    fontSize: '0.78rem',
                    letterSpacing: '0.2px',
                    backgroundColor: '#f8fafc !important',
                    color: '#1e293b',
                    py: 1.1,
                    px: 0.6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'center',
                    borderBottom: '2px solid #cbd5e1',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === col.key}
                    direction={orderBy === col.key ? orderDir : 'asc'}
                    onClick={() => handleSort(col.key)}
                    sx={{ width: '100%', justifyContent: 'center' }}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((row, idx) => {
              let className = '';
              const hasFechaTerminoCampo = !!(row.fechaTerminoCampo && String(row.fechaTerminoCampo).trim() !== '');
              const hasFechaTerminoConstruccion = !!(
                (row.fechaFinConstruccion && String(row.fechaFinConstruccion).trim() !== '') ||
                (row.fechaTermino && String(row.fechaTermino).trim() !== '')
              );

              if (row.estatus === 'CAPITALIZADA') {
                if (!hasFechaTerminoCampo) {
                  className = 'status-anomaly-red';
                } else {
                  className = 'status-capitalizada';
                }
              } else if (hasFechaTerminoCampo) {
                className = 'status-terminada';
              } else if (hasFechaTerminoConstruccion && !hasFechaTerminoCampo) {
                className = 'status-conexion-yellow';
              } else if (row.estatus === 'PENDIENTE') {
                className = 'status-pendiente';
              } else if (row.estatus === 'ASIGNADA') {
                className = 'status-asignada';
              }
              return (
                <TableRow key={idx} hover className={className}>
                  {visibleColumns.map((col) => {
                    const alignment = col.align || 'center';
                    return (
                      <TableCell
                        key={String(col.key)}
                        align={alignment}
                        sx={{
                          width: (col as any).width || 'auto',
                          py: 0.85,
                          px: 0.6,
                          fontSize: '0.80rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 4, color: 'var(--color-text-light)' }}>
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Small count indicator at the bottom */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, pr: 1 }}>
        <Typography variant="caption" sx={{ color: 'var(--color-text-light)', fontWeight: 600 }}>
          Total de registros: {sorted.length}
        </Typography>
      </Box>
    </Paper>
  );
}

