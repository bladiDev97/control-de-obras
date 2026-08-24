import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  InputAdornment,
  IconButton,
  MenuItem
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { configService, SmtpConfig } from '../services/config.service';

export const ConfiguracionPage: React.FC = () => {
  const [smtp, setSmtp] = useState<SmtpConfig>({
    host: '',
    port: 587,
    user: '',
    pass: '',
    from: '',
    whatsappPhone: '',
    whatsappApiKey: '',
    whatsappHourMorning: '09:00',
    whatsappHourAfternoon: '18:00',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Test Dialog
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  // Notification states
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchSmtpConfig();
  }, []);

  const fetchSmtpConfig = async () => {
    try {
      const data = await configService.getSmtp();
      if (data) {
        setSmtp({
          host: data.host || '',
          port: data.port || 587,
          user: data.user || '',
          pass: data.pass || '',
          from: data.from || '',
          whatsappPhone: data.whatsappPhone || '',
          whatsappApiKey: data.whatsappApiKey || '',
          whatsappHourMorning: data.whatsappHourMorning || '09:00',
          whatsappHourAfternoon: data.whatsappHourAfternoon || '18:00',
        });
      }
    } catch (err) {
      showNotification('Error al cargar la configuración.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const handleSaveSmtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingSmtp(true);
    try {
      const data = await configService.saveSmtp({
        host: smtp.host,
        port: Number(smtp.port || 587),
        user: smtp.user,
        pass: smtp.pass,
        from: smtp.from,
      });
      if (data) {
        setSmtp(prev => ({ ...prev, ...data }));
        showNotification('Configuración de Correo (SMTP) guardada exitosamente.', 'success');
      }
    } catch (err) {
      showNotification('Error al guardar la configuración de correo.', 'error');
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSaveWhatsapp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingWhatsapp(true);
    try {
      const data = await configService.saveSmtp({
        whatsappPhone: smtp.whatsappPhone,
        whatsappApiKey: smtp.whatsappApiKey,
        whatsappHourMorning: smtp.whatsappHourMorning,
        whatsappHourAfternoon: smtp.whatsappHourAfternoon,
      });
      if (data) {
        setSmtp(prev => ({ ...prev, ...data }));
        showNotification('Configuración de WhatsApp guardada exitosamente.', 'success');
      }
    } catch (err) {
      showNotification('Error al guardar la configuración de WhatsApp.', 'error');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testEmail.trim()) {
      showNotification('Por favor ingresa un correo de destino para la prueba.', 'error');
      return;
    }

    setTestDialogOpen(false);
    setTesting(true);
    try {
      await configService.testSmtp({
        ...smtp,
        port: Number(smtp.port),
        recipient: testEmail.trim(),
      });
      showNotification('¡Conexión SMTP exitosa! Correo de prueba enviado.', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      
      // Guide the user if it's a Gmail authentication issue
      if (errorMessage.includes('535') || errorMessage.includes('BadCredentials') || errorMessage.includes('Username and Password not accepted')) {
        showNotification(
          'Fallo de autenticación. Si usas Gmail, asegúrate de activar la verificación en 2 pasos y usar una "Contraseña de aplicación" en lugar de tu contraseña normal.',
          'error'
        );
      } else {
        showNotification(`Fallo en la prueba SMTP: ${errorMessage}`, 'error');
      }
    } finally {
      setTesting(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleTestWhatsapp = async () => {
    if (!smtp.whatsappPhone || !smtp.whatsappApiKey) {
      showNotification('Ingresa el teléfono y API Key para probar.', 'error');
      return;
    }
    setTesting(true);
    try {
      await configService.testWhatsapp({ whatsappPhone: smtp.whatsappPhone, whatsappApiKey: smtp.whatsappApiKey });
      showNotification('Mensaje de prueba de WhatsApp enviado correctamente.', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      showNotification(`Fallo en la prueba de WhatsApp: ${errorMessage}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleTestWhatsappAlert = async () => {
    if (!smtp.whatsappPhone || !smtp.whatsappApiKey) {
      showNotification('Ingresa el teléfono y API Key para probar.', 'error');
      return;
    }
    setTesting(true);
    try {
      const count = await configService.testWhatsappAlert();
      showNotification(`¡Alerta enviada! Se procesaron ${count} obra(s) por vencer y se enviaron a tu WhatsApp.`, 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      showNotification(`Fallo al probar alertas: ${errorMessage}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#0f172a' }}>
        Configuración de Conexiones
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
        Configura los parámetros del servidor de salida de correo (SMTP) y el servicio de mensajería (WhatsApp - CallMeBot) para habilitar envíos automáticos.
      </Typography>

      <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0f172a' }}>
            Servicio de Correo (SMTP)
          </Typography>
          <form id="configForm" onSubmit={handleSaveSmtp}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Servidor SMTP (Host)"
                  placeholder="ej: smtp.gmail.com o mail.empresa.com"
                  size="small"
                  value={smtp.host}
                  onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ autoComplete: 'off' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Puerto SMTP"
                  placeholder="ej: 587 o 465"
                  type="number"
                  size="small"
                  value={smtp.port}
                  onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                  fullWidth
                  required
                  inputProps={{ autoComplete: 'off' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Usuario / Correo electrónico de acceso"
                  placeholder="ej: no-reply@empresa.com"
                  size="small"
                  value={smtp.user}
                  onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ autoComplete: 'off' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Contraseña o Token de Aplicación"
                  type={showPassword ? 'text' : 'password'}
                  size="small"
                  value={smtp.pass}
                  onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ autoComplete: 'new-password' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Correo del Remitente (From Address)"
                  placeholder="ej: no-reply@empresa.com (Dejar en blanco para usar el Usuario)"
                  size="small"
                  value={smtp.from}
                  onChange={(e) => setSmtp({ ...smtp, from: e.target.value })}
                  fullWidth
                  inputProps={{ autoComplete: 'off' }}
                  helperText="Algunos proveedores requieren que coincida exactamente con el usuario de acceso."
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={testing ? <CircularProgress size={18} /> : <CheckCircleOutlineIcon />}
                  onClick={() => setTestDialogOpen(true)}
                  disabled={testing || savingSmtp || !smtp.host || !smtp.user || !smtp.pass}
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
                >
                  {testing ? 'Verificando...' : 'Probar Conexión'}
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={savingSmtp ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  disabled={savingSmtp || testing}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 4,
                    backgroundColor: 'var(--color-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-secondary)',
                    }
                  }}
                >
                  {savingSmtp ? 'Guardando Correo...' : 'Guardar Configuración SMTP'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            Servicio de Notificaciones (WhatsApp - CallMeBot)
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
            Para habilitar este servicio gratuito, envía un mensaje de WhatsApp con el texto <b>I allow callmebot to send me messages</b> al número <b>+34 644 17 94 64</b> para obtener tu API Key.
          </Typography>
          <form id="whatsappForm" onSubmit={handleSaveWhatsapp}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Teléfono"
                  placeholder="ej: +5214437969662"
                  type="text"
                  size="small"
                  value={smtp.whatsappPhone}
                  onChange={(e) => setSmtp({ ...smtp, whatsappPhone: e.target.value })}
                  fullWidth
                  inputProps={{ autoComplete: 'off' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="API Key de CallMeBot"
                  type="password"
                  size="small"
                  value={smtp.whatsappApiKey}
                  onChange={(e) => setSmtp({ ...smtp, whatsappApiKey: e.target.value })}
                  fullWidth
                  inputProps={{ autoComplete: 'off' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  label="🌅 Hora de Envío (Mañana)"
                  size="small"
                  value={smtp.whatsappHourMorning || '09:00'}
                  onChange={(e) => setSmtp({ ...smtp, whatsappHourMorning: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  label="🌇 Hora de Envío (Tarde)"
                  size="small"
                  value={smtp.whatsappHourAfternoon || '18:00'}
                  onChange={(e) => setSmtp({ ...smtp, whatsappHourAfternoon: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={testing ? <CircularProgress size={18} /> : <SendIcon />}
                      onClick={handleTestWhatsapp}
                      disabled={testing || savingWhatsapp || !smtp.whatsappPhone || !smtp.whatsappApiKey}
                      sx={{ borderRadius: '8px', textTransform: 'none', px: 2, whiteSpace: 'nowrap', borderColor: '#25D366', color: '#25D366', '&:hover': { borderColor: '#128C7E', color: '#128C7E', backgroundColor: 'rgba(37, 211, 102, 0.04)' } }}
                    >
                      {testing ? 'Verificando...' : 'Probar WhatsApp'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={testing ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                      onClick={handleTestWhatsappAlert}
                      disabled={testing || savingWhatsapp || !smtp.whatsappPhone || !smtp.whatsappApiKey}
                      sx={{ borderRadius: '8px', textTransform: 'none', px: 2, whiteSpace: 'nowrap', backgroundColor: '#ea580c', '&:hover': { backgroundColor: '#c2410c' } }}
                    >
                      Probar Alertas
                    </Button>
                    <Button
                      variant="text"
                      color="error"
                      onClick={async () => {
                        const newData = { ...smtp, whatsappPhone: '', whatsappApiKey: '' };
                        setSmtp(newData);
                        await configService.saveSmtp({ ...newData, port: Number(newData.port) });
                        showNotification('Configuración de WhatsApp eliminada.', 'info');
                      }}
                      sx={{ borderRadius: '8px', textTransform: 'none', whiteSpace: 'nowrap' }}
                    >
                      Borrar WhatsApp
                    </Button>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={savingWhatsapp ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    disabled={savingWhatsapp || testing}
                    onClick={() => handleSaveWhatsapp()}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 3.5,
                      py: 1,
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content',
                      backgroundColor: 'var(--color-primary)',
                      '&:hover': {
                        backgroundColor: 'var(--color-secondary)',
                      }
                    }}
                  >
                    {savingWhatsapp ? 'Guardando WhatsApp...' : 'Guardar Configuración WhatsApp'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Test Connection Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Probar Conexión SMTP</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ingresa una dirección de correo electrónico válida para enviar un mensaje de prueba con las credenciales ingresadas.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Correo Electrónico de Destino"
            type="email"
            fullWidth
            variant="outlined"
            size="small"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setTestDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: '8px' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleTestConnection}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!testEmail.trim()}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-secondary)',
              }
            }}
          >
            Enviar Correo de Prueba
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
