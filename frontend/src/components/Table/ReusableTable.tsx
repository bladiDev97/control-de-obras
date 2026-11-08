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
  Checkbox,
  ListItemText,
  Collapse,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  width?: string;
  minWidth?: string;
  sortable?: boolean;
}

export interface ReusableTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  searchable?: boolean;
  defaultOrderBy?: keyof T;
  defaultOrderDir?: 'asc' | 'desc';
  customSort?: (a: T, b: T) => number;
  showStatusFilter?: boolean;
  showTipoObraFilter?: boolean;
  showAnioFilter?: boolean;
  showColorFilter?: boolean;
  showAdvancedFilters?: boolean;
  autoScrollToBottom?: boolean;
}

export default function ReusableTable<T extends Record<string, any>>({
  columns,
  rows,
  searchable = true,
  defaultOrderBy,
  defaultOrderDir,
  customSort,
  showStatusFilter,
  showTipoObraFilter,
  showAnioFilter,
  showColorFilter,
  showAdvancedFilters: allowAdvancedFilters = true,
  autoScrollToBottom = false,
}: ReusableTableProps<T>) {
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<keyof T | null>(defaultOrderBy || null);
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>(defaultOrderDir || 'asc');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Show/Hide Días columns state
  const [showDias, setShowDias] = useState<boolean>(true);

  // Multi-color filter state
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Check available filterable columns dynamically (respecting props)
  const hasStatusColumn = (showStatusFilter ?? true) && columns.some((col) => col.key === 'estatus');
  const hasTipoObraColumn = (showTipoObraFilter ?? true) && rows.length > 0 && 'tipoObra' in rows[0];
  const hasAnioColumn = (showAnioFilter ?? true) && rows.length > 0 && 'anio' in rows[0];

  const [statusFilter, setStatusFilter] = useState<string[]>(['TODOS']);
  const [tipoObraFilter, setTipoObraFilter] = useState<string>('TODOS');
  const [anioFilter, setAnioFilter] = useState<string>('TODOS');

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [minDias, setMinDias] = useState<string>('');
  const [maxDias, setMaxDias] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [contratistaFilter, setContratistaFilter] = useState<string>('TODOS');

  // Auto-scroll table container to bottom on load if autoScrollToBottom is true
  useEffect(() => {
    if (autoScrollToBottom && tableContainerRef.current && rows.length > 0) {
      const scrollToBottom = () => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
        }
      };
      const timer1 = setTimeout(scrollToBottom, 100);
      const timer2 = setTimeout(scrollToBottom, 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [rows.length, statusFilter.join(','), autoScrollToBottom]);

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

  const hasColorFilter =
    (showColorFilter ?? true) &&
    (hasDiasColumn ||
      (rows.length > 0 &&
        ('diasSinCapitalizar' in rows[0] || 'dias' in rows[0] || 'diasParaVencerse' in rows[0])));

  // Helper to classify row color(s) for the COLOR: filter dropdown (based on DAYS / POR VENCER badge & text colors)
  const getRowColors = (row: any): string[] => {
    const colors: string[] = [];
    const hasFechaFinConstruccion = !!(
      row.fechaFinConstruccion && String(row.fechaFinConstruccion).trim() !== ''
    );

    // 1. Check POR VENCER badge colors if applicable
    if (
      typeof row.diasParaVencerse === 'number' &&
      row.estatus !== 'CAPITALIZADA' &&
      row.estatus !== 'TERMINADA' &&
      row.estatus !== 'CANCELADA'
    ) {
      const days = row.diasParaVencerse;
      if (days <= 3) {
        if (!colors.includes('ROJO')) colors.push('ROJO');
      } else if (days >= 4 && days <= 10) {
        if (!colors.includes('NARANJA')) colors.push('NARANJA');
      } else if (days > 10) {
        if (!colors.includes('VERDE')) colors.push('VERDE');
      }
    }

    // 2. Check DÍAS / DÍAS SIN CAPITALIZAR text & badge colors
    const dayVal =
      typeof row.diasSinCapitalizar === 'number' && hasFechaFinConstruccion
        ? row.diasSinCapitalizar
        : typeof row.dias === 'number'
        ? row.dias
        : null;

    if (dayVal !== null) {
      if (dayVal >= 17) {
        if (!colors.includes('ROJO')) colors.push('ROJO');
      } else if (dayVal >= 11) {
        if (!colors.includes('NARANJA')) colors.push('NARANJA');
      } else {
        if (!colors.includes('VERDE')) colors.push('VERDE');
      }
    }

    // 3. Status fallback if no days colors matched
    if (colors.length === 0) {
      if (row.estatus === 'CANCELADA') {
        colors.push('ROJO');
      } else if (row.estatus === 'CAPITALIZADA') {
        if (!hasFechaFinConstruccion) {
          colors.push('ROJO');
        } else {
          colors.push('VERDE');
        }
      } else {
        colors.push('NARANJA');
      }
    }

    return colors;
  };

  // Compute unique values for dropdowns
  const tipoObraOptions = React.useMemo(() => {
    return Array.from(
      new Set(rows.map((r) => String(r.tipoObra || '').toUpperCase().trim()).filter(Boolean))
    ).sort();
  }, [rows]);

  const anioOptions = React.useMemo(() => {
    return Array.from(
      new Set(rows.map((r) => String(r.anio || '').trim()).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));
  }, [rows]);

  const contratistaOptions = React.useMemo(() => {
    return Array.from(
      new Set(rows.map((r) => String(r.contratista || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // Compute active advanced filters count
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (!statusFilter.includes('TODOS') && statusFilter.length > 0) count++;
    if (tipoObraFilter !== 'TODOS') count++;
    if (anioFilter !== 'TODOS') count++;
    if (contratistaFilter !== 'TODOS') count++;
    if (minDias !== '' || maxDias !== '') count++;
    if (fechaDesde !== '' || fechaHasta !== '') count++;
    return count;
  }, [statusFilter, tipoObraFilter, anioFilter, contratistaFilter, minDias, maxDias, fechaDesde, fechaHasta]);

  const handleResetFilters = () => {
    setStatusFilter(['TODOS']);
    setTipoObraFilter('TODOS');
    setAnioFilter('TODOS');
    setContratistaFilter('TODOS');
    setMinDias('');
    setMaxDias('');
    setFechaDesde('');
    setFechaHasta('');
  };

  // Apply filters
  const filtered = rows.filter((row) => {
    // 1. Status Filter (Permite seleccionar 2 o más variables a la vez)
    if (hasStatusColumn && !statusFilter.includes('TODOS') && statusFilter.length > 0) {
      if (!statusFilter.includes(row.estatus)) return false;
    }
    // 2. Tipo Obra Filter
    if (tipoObraFilter !== 'TODOS') {
      if (String(row.tipoObra || '').toUpperCase().trim() !== tipoObraFilter.toUpperCase()) return false;
    }
    // 3. Anio Filter
    if (anioFilter !== 'TODOS') {
      if (String(row.anio || '').trim() !== String(anioFilter).trim()) return false;
    }
    // 4. Contratista Filter
    if (contratistaFilter !== 'TODOS') {
      if (String(row.contratista || '').trim().toUpperCase() !== contratistaFilter.toUpperCase()) return false;
    }
    // 5. Rango de Días Transcurridos
    const rowDias = typeof row.dias === 'number' ? row.dias : (parseInt(row.dias, 10) || 0);
    if (minDias !== '' && !isNaN(Number(minDias))) {
      if (rowDias < Number(minDias)) return false;
    }
    if (maxDias !== '' && !isNaN(Number(maxDias))) {
      if (rowDias > Number(maxDias)) return false;
    }
    // 6. Rango de Fechas
    const rowDate = (row.fechaAsignacion || row.fechaPago || row.fechaInicio || row.fechaTerminoCampo || row.createdAt || '')
      ? String(row.fechaAsignacion || row.fechaPago || row.fechaInicio || row.fechaTerminoCampo || row.createdAt).substring(0, 10)
      : '';
    if (fechaDesde && rowDate && rowDate < fechaDesde) return false;
    if (fechaHasta && rowDate && rowDate > fechaHasta) return false;

    // 7. Color Filter
    if (hasColorFilter && selectedColors.length > 0 && !selectedColors.includes('TODOS')) {
      const rowColors = getRowColors(row);
      const matches = selectedColors.some(
        (c) =>
          rowColors.includes(c) ||
          (c === 'NARANJA' &&
            (rowColors.includes('AMARILLO') ||
              rowColors.includes('AZUL') ||
              rowColors.includes('NARANJA')))
      );
      if (!matches) return false;
    }
    // 8. Search Text Filter
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
      {(searchable ||
        hasStatusColumn ||
        (hasTipoObraColumn && tipoObraOptions.length > 0) ||
        (hasAnioColumn && anioOptions.length > 0) ||
        hasColorFilter ||
        hasDiasColumn) && (
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
            {hasStatusColumn && !allowAdvancedFilters && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  Estatus:
                </Typography>
                <Select
                  multiple
                  size="small"
                  fullWidth
                  value={statusFilter.length === 0 ? ['TODOS'] : statusFilter}
                  onChange={(e) => {
                    const val =
                      typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : (e.target.value as string[]);
                    if (val.includes('TODOS')) {
                      if (statusFilter.includes('TODOS')) {
                        const clean = val.filter((v) => v !== 'TODOS');
                        setStatusFilter(clean.length === 0 ? ['TODOS'] : clean);
                      } else {
                        setStatusFilter(['TODOS']);
                      }
                    } else {
                      setStatusFilter(val.length === 0 ? ['TODOS'] : val);
                    }
                  }}
                  renderValue={(selected) => {
                    const sel = selected as string[];
                    if (sel.includes('TODOS') || sel.length === 0) return 'TODOS';
                    const labels: Record<string, string> = {
                      PENDIENTE: 'ASIGNAR',
                      ASIGNADA: 'PROCESO',
                      TERMINADA: 'TERMINADA',
                      CAPITALIZADA: 'CAPITALIZADA',
                      CANCELADA: 'CANCELADA',
                    };
                    return sel.map((s) => labels[s] || s).join(', ');
                  }}
                  sx={{
                    height: 36,
                    minWidth: { xs: 110, sm: 140 },
                    maxWidth: { xs: 200, sm: 260 },
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('TODOS') || statusFilter.length === 0}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="TODOS" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: (statusFilter.includes('TODOS') || statusFilter.length === 0) ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="PENDIENTE" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('PENDIENTE')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="ASIGNAR" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('PENDIENTE') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="ASIGNADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('ASIGNADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="PROCESO" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('ASIGNADA') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="TERMINADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('TERMINADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="TERMINADA" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('TERMINADA') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="CAPITALIZADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('CAPITALIZADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="CAPITALIZADA" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('CAPITALIZADA') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="CANCELADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('CANCELADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="CANCELADA" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('CANCELADA') ? 800 : 400 }} />
                  </MenuItem>
                </Select>
              </Box>
            )}

            {hasTipoObraColumn && !allowAdvancedFilters && tipoObraOptions.length > 0 && (
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

            {hasAnioColumn && !allowAdvancedFilters && anioOptions.length > 0 && (
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

            {/* Color Filter Dropdown: VERDES (INVENTARIO), ROJAS (CAPITALIZAR), NARANJAS (CONCILIAR) */}
            {hasColorFilter && !allowAdvancedFilters && (
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
                    const val =
                      typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : (e.target.value as string[]);
                    if (val.includes('TODOS') && !selectedColors.includes('TODOS') && val.length > 1) {
                      setSelectedColors(['TODOS']);
                    } else {
                      const clean = val.filter((v) => v !== 'TODOS');
                      setSelectedColors(clean.length === 0 ? ['TODOS'] : clean);
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected.includes('TODOS') || selected.length === 0) return 'TODOS';
                    return selected
                      .map((c) => {
                        if (c === 'VERDE') return '🟢 VERDE';
                        if (c === 'ROJO') return '🔴 ROJO';
                        if (c === 'NARANJA' || c === 'AZUL' || c === 'AMARILLO') return '🟠 NARANJA';
                        return c;
                      })
                      .join(', ');
                  }}
                  sx={{
                    height: 36,
                    minWidth: { xs: 110, sm: 140 },
                    maxWidth: { xs: 180, sm: 230 },
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <MenuItem
                    value="TODOS"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: selectedColors.includes('TODOS') || selectedColors.length === 0 ? 800 : 400,
                    }}
                  >
                    TODOS
                  </MenuItem>
                  <MenuItem
                    value="VERDE"
                    sx={{
                      fontSize: '0.8rem',
                      color: '#15803d',
                      fontWeight: selectedColors.includes('VERDE') ? 800 : 400,
                    }}
                  >
                    🟢 VERDE (≤ 10 DÍAS)
                  </MenuItem>
                  <MenuItem
                    value="ROJO"
                    sx={{
                      fontSize: '0.8rem',
                      color: '#dc2626',
                      fontWeight: selectedColors.includes('ROJO') ? 800 : 400,
                    }}
                  >
                    🔴 ROJO (≥ 17 DÍAS)
                  </MenuItem>
                  <MenuItem
                    value="NARANJA"
                    sx={{
                      fontSize: '0.8rem',
                      color: '#EE6C00',
                      fontWeight: selectedColors.includes('NARANJA') ? 800 : 400,
                    }}
                  >
                    🟠 NARANJA (11 - 16 DÍAS)
                  </MenuItem>
                </Select>
              </Box>
            )}

            {/* Button to Toggle Advanced Filters Panel */}
            {allowAdvancedFilters && (
              <Button
                size="small"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                title={showAdvancedFilters ? 'Ocultar panel de filtros avanzados' : 'Abrir panel de filtros avanzados'}
                startIcon={<FilterAltIcon fontSize="small" />}
                sx={{
                  height: 36,
                  px: 1.5,
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  backgroundColor: showAdvancedFilters || activeFiltersCount > 0 ? 'rgba(0, 142, 96, 0.1) !important' : '#ffffff !important',
                  color: showAdvancedFilters || activeFiltersCount > 0 ? 'var(--verde-cfe) !important' : '#334155 !important',
                  border: showAdvancedFilters || activeFiltersCount > 0 ? '1.5px solid var(--verde-cfe) !important' : '1px solid #cbd5e1 !important',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06) !important',
                  '&:hover': {
                    backgroundColor: showAdvancedFilters || activeFiltersCount > 0 ? 'rgba(0, 142, 96, 0.18) !important' : '#f8fafc !important',
                    borderColor: 'var(--verde-cfe) !important',
                  },
                }}
              >
                Filtros Avanzados
                {activeFiltersCount > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.8,
                      bgcolor: 'var(--verde-cfe)',
                      color: '#ffffff',
                      borderRadius: '10px',
                      px: 0.7,
                      py: 0.1,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}
                  >
                    {activeFiltersCount}
                  </Box>
                )}
              </Button>
            )}

            {/* Toggle button to show/hide Días columns with small Red / Green indicator circle */}
            {hasDiasColumn && (
              <Button
                size="small"
                onClick={() => setShowDias(!showDias)}
                title={showDias ? 'Días Visibles (Clic para ocultar)' : 'Días Ocultos (Clic para mostrar)'}
                sx={{
                  height: 36,
                  px: 1.5,
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1 !important',
                  backgroundColor: '#ffffff !important',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06) !important',
                  '&:hover': {
                    backgroundColor: '#f8fafc !important',
                    borderColor: '#94a3b8 !important',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: showDias ? '#22c55e' : '#ef4444',
                    boxShadow: showDias ? '0 0 6px rgba(34, 197, 94, 0.7)' : '0 0 6px rgba(239, 68, 68, 0.7)',
                    transition: 'all 0.2s ease',
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#334155' }}>
                  Días
                </Typography>
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* 🚀 Panel Desplegable de Filtros Avanzados */}
      {allowAdvancedFilters && (
        <Collapse in={showAdvancedFilters}>
        <Box
          sx={{
            mt: 0.5,
            mb: 2.5,
            p: 2.2,
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          {/* Header del Panel */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterAltIcon sx={{ color: 'var(--verde-cfe)', fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px', fontSize: '0.88rem' }}>
                Filtros Avanzados
              </Typography>
              {activeFiltersCount > 0 && (
                <Chip
                  label={`${activeFiltersCount} ${activeFiltersCount === 1 ? 'filtro activo' : 'filtros activos'}`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'var(--verde-cfe)', color: '#ffffff' }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {activeFiltersCount > 0 && (
                <Button
                  size="small"
                  onClick={handleResetFilters}
                  startIcon={<FilterAltOffIcon fontSize="small" />}
                  sx={{
                    color: '#dc2626',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    p: '3px 10px',
                    borderRadius: '6px',
                    '&:hover': { bgcolor: '#fee2e2' },
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
              <Button
                size="small"
                onClick={() => setShowAdvancedFilters(false)}
                sx={{
                  color: '#64748b',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  p: '3px 8px',
                }}
              >
                Cerrar panel
              </Button>
            </Box>
          </Box>

          {/* Grid de Controles de Filtros */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
              alignItems: 'flex-start',
            }}
          >
            {/* 1. Estatus (Múltiple) */}
            {hasStatusColumn && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  ESTATUS (MULTIVARIABLE)
                </Typography>
                <Select
                  multiple
                  size="small"
                  fullWidth
                  value={statusFilter.length === 0 ? ['TODOS'] : statusFilter}
                  onChange={(e) => {
                    const val =
                      typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : (e.target.value as string[]);
                    if (val.includes('TODOS')) {
                      if (statusFilter.includes('TODOS')) {
                        const clean = val.filter((v) => v !== 'TODOS');
                        setStatusFilter(clean.length === 0 ? ['TODOS'] : clean);
                      } else {
                        setStatusFilter(['TODOS']);
                      }
                    } else {
                      setStatusFilter(val.length === 0 ? ['TODOS'] : val);
                    }
                  }}
                  renderValue={(selected) => {
                    const sel = selected as string[];
                    if (sel.includes('TODOS') || sel.length === 0) return 'TODOS';
                    const labels: Record<string, string> = {
                      PENDIENTE: 'ASIGNAR',
                      ASIGNADA: 'PROCESO',
                      TERMINADA: 'TERMINADA',
                      CAPITALIZADA: 'CAPITALIZADA',
                      CANCELADA: 'CANCELADA',
                    };
                    return sel.map((s) => labels[s] || s).join(', ');
                  }}
                  sx={{
                    height: 36,
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('TODOS') || statusFilter.length === 0}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="TODOS" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: (statusFilter.includes('TODOS') || statusFilter.length === 0) ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="PENDIENTE" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('PENDIENTE')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="ASIGNAR" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('PENDIENTE') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="ASIGNADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('ASIGNADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="PROCESO" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('ASIGNADA') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="TERMINADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('TERMINADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="TERMINADA" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('TERMINADA') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="CAPITALIZADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('CAPITALIZADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="CAPITALIZADA" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('CAPITALIZADA') ? 800 : 400 }} />
                  </MenuItem>
                  <MenuItem value="CANCELADA" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={statusFilter.includes('CANCELADA')}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary="CANCELADA" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: statusFilter.includes('CANCELADA') ? 800 : 400 }} />
                  </MenuItem>
                </Select>
              </Box>
            )}

            {/* 2. Contratista */}
            {contratistaOptions.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  CONTRATISTA
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={contratistaFilter}
                  onChange={(e) => setContratistaFilter(e.target.value)}
                  sx={{ height: 36, fontSize: '0.8rem', bgcolor: '#ffffff', borderRadius: '8px' }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem' }}>TODOS ({contratistaOptions.length})</MenuItem>
                  {contratistaOptions.map((c) => (
                    <MenuItem key={c} value={c} sx={{ fontSize: '0.8rem' }}>{c}</MenuItem>
                  ))}
                </Select>
              </Box>
            )}

            {/* 3. Tipo de Obra */}
            {tipoObraOptions.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  TIPO DE OBRA
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={tipoObraFilter}
                  onChange={(e) => setTipoObraFilter(e.target.value)}
                  sx={{ height: 36, fontSize: '0.8rem', bgcolor: '#ffffff', borderRadius: '8px' }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem' }}>TODOS ({tipoObraOptions.length})</MenuItem>
                  {tipoObraOptions.map((t) => (
                    <MenuItem key={t} value={t} sx={{ fontSize: '0.8rem' }}>{t}</MenuItem>
                  ))}
                </Select>
              </Box>
            )}

            {/* 4. Año */}
            {anioOptions.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                  AÑO
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={anioFilter}
                  onChange={(e) => setAnioFilter(e.target.value)}
                  sx={{ height: 36, fontSize: '0.8rem', bgcolor: '#ffffff', borderRadius: '8px' }}
                >
                  <MenuItem value="TODOS" sx={{ fontSize: '0.8rem' }}>TODOS ({anioOptions.length})</MenuItem>
                  {anioOptions.map((a) => (
                    <MenuItem key={a} value={a} sx={{ fontSize: '0.8rem' }}>{a}</MenuItem>
                  ))}
                </Select>
              </Box>
            )}

            {/* 5. Rango de Días Transcurridos */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                DÍAS TRANSCURRIDOS (MÍN - MÁX)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Mín"
                  value={minDias}
                  onChange={(e) => setMinDias(e.target.value)}
                  sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8rem' } }}
                />
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>-</Typography>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Máx"
                  value={maxDias}
                  onChange={(e) => setMaxDias(e.target.value)}
                  sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8rem' } }}
                />
              </Box>
            </Box>

            {/* 6. Rango de Fechas (Desde - Hasta) */}
            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}>
                RANGO DE FECHAS (ASIGNACIÓN / INICIO / PAGO)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="date"
                  label="Desde"
                  InputLabelProps={{ shrink: true }}
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  sx={{ bgcolor: '#ffffff', flex: 1, '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8rem' } }}
                />
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>a</Typography>
                <TextField
                  size="small"
                  type="date"
                  label="Hasta"
                  InputLabelProps={{ shrink: true }}
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  sx={{ bgcolor: '#ffffff', flex: 1, '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8rem' } }}
                />
              </Box>
            </Box>
          </Box>

          {/* Footer summary inside panel */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Mostrando <strong>{filtered.length}</strong> de <strong>{rows.length}</strong> obras
            </Typography>
            {activeFiltersCount > 0 && (
              <Typography variant="caption" sx={{ color: 'var(--verde-cfe)', fontWeight: 700 }}>
                Filtros combinados activos: {activeFiltersCount}
              </Typography>
            )}
          </Box>
        </Box>
      </Collapse>
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
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  align={col.align || 'center'}
                  sx={{
                    width: (col as any).width || 'auto',
                    minWidth: (col as any).minWidth || undefined,
                    fontWeight: '800',
                    fontSize: '0.74rem',
                    letterSpacing: '0.3px',
                    backgroundColor: '#eef6f3 !important',
                    color: '#005a3c',
                    py: 1.0,
                    px: 0.6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: col.align || 'center',
                    borderBottom: '2.5px solid #008E60 !important',
                    borderRight: 'none !important',
                    '&:last-child': {
                      borderRight: 'none !important',
                      pr: 1.2,
                    },
                  }}
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? orderDir : 'asc'}
                      onClick={() => handleSort(col.key)}
                      sx={{
                        width: '100%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: col.align === 'left' ? 'flex-start' : col.align === 'right' ? 'flex-end' : 'center',
                        textAlign: col.align || 'center',
                        margin: 0,
                        padding: 0,
                        '& .MuiTableSortLabel-icon': {
                          position: 'absolute',
                          right: '2px',
                          display: orderBy === col.key ? 'inline-block !important' : 'none !important',
                          margin: '0 !important',
                          width: '14px',
                          height: '14px',
                        },
                        '&.Mui-active': {
                          color: '#005a3c !important',
                          '& .MuiTableSortLabel-icon': {
                            color: '#008E60 !important',
                          },
                        },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    <Box sx={{ width: '100%', textAlign: col.align || 'center', userSelect: 'none' }}>
                      {col.label}
                    </Box>
                  )}
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

              if (row.estatus === 'CANCELADA') {
                className = 'status-cancelada';
              } else if (row.estatus === 'CAPITALIZADA') {
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
                    const isTipoObra = col.key === 'tipoObra';
                    return (
                      <TableCell
                        key={String(col.key)}
                        align={alignment}
                        sx={{
                          width: (col as any).width || 'auto',
                          minWidth: (col as any).minWidth || undefined,
                          py: 0.85,
                          px: 0.6,
                          fontSize: '0.78rem',
                          textAlign: alignment,
                          borderRight: 'none !important',
                          borderBottom: '1px solid #cbd5e1 !important',
                          '&:last-child': {
                            borderRight: 'none !important',
                            pr: 1.2,
                          },
                          overflow: isTipoObra ? 'visible' : 'hidden',
                          textOverflow: isTipoObra ? 'clip' : 'ellipsis',
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

