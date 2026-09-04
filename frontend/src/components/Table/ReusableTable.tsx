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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    // 4. Search Text Filter
    return columns.some((col) =>
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
      {/* Toolbar: Search input + Multi-Dropdown Filters */}
      {(searchable || hasStatusColumn || hasTipoObraColumn || hasAnioColumn) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px', mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {searchable && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '1 1 200px' }}>
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
                sx={{ maxWidth: 280 }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {hasStatusColumn && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Estatus:
                </Typography>
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    height: 36,
                    minWidth: 130,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tipo:
                </Typography>
                <Select
                  size="small"
                  value={tipoObraFilter}
                  onChange={(e) => setTipoObraFilter(e.target.value)}
                  sx={{
                    height: 36,
                    minWidth: 120,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Año:
                </Typography>
                <Select
                  size="small"
                  value={anioFilter}
                  onChange={(e) => setAnioFilter(e.target.value)}
                  sx={{
                    height: 36,
                    minWidth: 100,
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
          </Box>
        </Box>
      )}

      <TableContainer ref={tableContainerRef} sx={{ width: '100%', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', overflowX: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Table size="small" stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
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
                  {columns.map((col) => {
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
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'var(--color-text-light)' }}>
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
