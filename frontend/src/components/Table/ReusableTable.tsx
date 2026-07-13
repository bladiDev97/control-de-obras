import React, { useState } from 'react';
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
}

export interface ReusableTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  searchable?: boolean;
  defaultOrderBy?: keyof T;
  defaultOrderDir?: 'asc' | 'desc';
}

export default function ReusableTable<T extends Record<string, any>>({
  columns,
  rows,
  searchable = true,
  defaultOrderBy,
  defaultOrderDir,
}: ReusableTableProps<T>) {
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<keyof T | null>(defaultOrderBy || null);
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>(defaultOrderDir || 'asc');

  // Check if rows have a status column to dynamically render CFE status filter
  const hasStatusColumn = rows.length > 0 && 'estatus' in rows[0];
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Apply filters
  const filtered = rows.filter((row) => {
    // 1. Status Filter
    if (hasStatusColumn && statusFilter !== 'TODOS') {
      if (row.estatus !== statusFilter) return false;
    }
    // 2. Search Text Filter
    return columns.some((col) =>
      String(row[col.key] ?? '')
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  });

  // Apply sorting
  const sorted = orderBy
    ? [...filtered].sort((a, b) => {
        const av = a[orderBy];
        const bv = b[orderBy];
        if (av < bv) return orderDir === 'asc' ? -1 : 1;
        if (av > bv) return orderDir === 'asc' ? 1 : -1;
        return 0;
      })
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
    <Paper className="card" style={{ padding: '20px', overflow: 'hidden' }}>
      {/* Toolbar: Search input + Status Dropdown Filter */}
      {(searchable || hasStatusColumn) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px', mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          {searchable && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                size="small"
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
                sx={{ width: 280 }}
              />
            </Box>
          )}

          {hasStatusColumn && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--color-text-light)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Filtrar Estatus:
              </Typography>
              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  height: 38,
                  minWidth: 160,
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                <MenuItem value="TODOS" sx={{ fontSize: '0.85rem' }}>TODOS</MenuItem>
                <MenuItem value="PENDIENTE" sx={{ fontSize: '0.85rem' }}>ASIGNAR</MenuItem>
                <MenuItem value="ASIGNADA" sx={{ fontSize: '0.85rem' }}>PROCESO</MenuItem>
                <MenuItem value="TERMINADA" sx={{ fontSize: '0.85rem' }}>TERMINADA</MenuItem>
                <MenuItem value="CAPITALIZADA" sx={{ fontSize: '0.85rem' }}>CAPITALIZADA</MenuItem>
              </Select>
            </Box>
          )}
        </Box>
      )}

      {/* Table Container - Fits all records with standard scrollbar */}
      <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const alignment = col.align || 'center';
                return (
                  <TableCell key={String(col.key)} align={alignment}>
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? orderDir : 'asc'}
                      onClick={() => handleSort(col.key)}
                      sx={alignment === 'center' ? { justifyContent: 'center' } : undefined}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((row, idx) => {
                let className = '';
                const hasFechaTermino = row.fechaTerminoCampo && String(row.fechaTerminoCampo).trim() !== '';

                if (row.estatus === 'CAPITALIZADA') {
                  if (!hasFechaTermino) {
                    className = 'status-anomaly-red';
                  } else {
                    className = 'status-capitalizada';
                  }
                } else if (hasFechaTermino) {
                  className = 'status-terminada';
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
                      <TableCell key={String(col.key)} align={alignment}>
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
