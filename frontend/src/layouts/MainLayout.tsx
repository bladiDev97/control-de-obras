import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
} from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookIcon from '@mui/icons-material/Book';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 280;

const menuItems = [
  { label: 'Obras', path: '/obras', icon: <AssignmentIcon /> },
  { label: 'Bitácoras', path: '/bitacoras', icon: <BookIcon /> },
  { label: 'Capitalización', path: '/capitalizacion', icon: <AttachMoneyIcon /> },
  { label: 'Contratos (Finanzas)', path: '/contratos', icon: <AccountBalanceWalletIcon /> },
  { label: 'Datos CFE', path: '/personal', icon: <AssignmentIndIcon /> },
  { label: 'Reportes', path: '/reportes', icon: <DescriptionIcon /> },
  { label: 'Configurar Conexión', path: '/configuracion', icon: <SettingsIcon /> },
  { label: 'Importar Solicitudes', path: '/excel', icon: <CloudUploadIcon /> },
];

export default function MainLayout() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1, color: '#ffffff' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontWeight: 850, letterSpacing: '-0.01em', color: '#ffffff' }}>
              ⚡ Control de Obras
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              bladi.PigeonSave@gmail.com
            </Typography>
            <Avatar sx={{ bgcolor: '#ffffff', color: 'var(--verde-cfe)', width: 32, height: 32, fontSize: '0.85rem', fontWeight: 'bold' }}>
              BL
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Collapsible Drawer Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleToggleDrawer(false)}
        sx={{
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Box
          sx={{ width: drawerWidth }}
          role="presentation"
          onClick={handleToggleDrawer(false)}
          onKeyDown={handleToggleDrawer(false)}
        >
          <Toolbar sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-primary)' }}>
              Menú de Navegación
            </Typography>
          </Toolbar>
          <List>
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.path || 
                                (item.path === '/obras' && location.pathname === '/');
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  selected={isSelected}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <main className="main-content" style={{ marginTop: 64, marginLeft: 0, width: '100%' }}>
        <div className="content-body" style={{ maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
        <footer className="app-footer">
          <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>© {new Date().getFullYear()} Control de Obras. Todos los derechos reservados.</div>
            <div>Versión 1.0.0 | CFE Distribución</div>
          </div>
        </footer>
      </main>
    </div>
  );
}

