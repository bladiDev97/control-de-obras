import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { ConfiguracionFirmas } from './ConfiguracionFirmas';
import { formatDateSpanish, getFechaConciliacion } from '../utils/reportesUtils';

interface ConciliacionPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  previewData: any;
  handlePrintConfirm: () => void;

  supervisorNombre: string;
  setSupervisorNombre: (v: string) => void;
  supervisorRpe: string;
  setSupervisorRpe: (v: string) => void;
  supervisorCargo: string;
  setSupervisorCargo: (v: string) => void;
  supervisorZona: string;
  setSupervisorZona: (v: string) => void;
  mostrarSupervisor: boolean;
  setMostrarSupervisor: (v: boolean) => void;

  adminNombre: string;
  setAdminNombre: (v: string) => void;
  adminRpe: string;
  setAdminRpe: (v: string) => void;
  adminCargo: string;
  setAdminCargo: (v: string) => void;
  adminZona: string;
  setAdminZona: (v: string) => void;
  mostrarAdmin: boolean;
  setMostrarAdmin: (v: boolean) => void;

  mostrarContratista: boolean;
  setMostrarContratista: (v: boolean) => void;

  superintendenteNombre: string;
  setSuperintendenteNombre: (v: string) => void;

  zonaFooterStr: string;
  zonaLocationStr: string;
}

export const ConciliacionPreviewDialog: React.FC<ConciliacionPreviewDialogProps> = ({
  open, onClose, previewData, handlePrintConfirm,
  supervisorNombre, setSupervisorNombre,
  supervisorRpe, setSupervisorRpe,
  supervisorCargo, setSupervisorCargo,
  supervisorZona, setSupervisorZona,
  mostrarSupervisor, setMostrarSupervisor,
  adminNombre, setAdminNombre,
  adminRpe, setAdminRpe,
  adminCargo, setAdminCargo,
  adminZona, setAdminZona,
  mostrarAdmin, setMostrarAdmin,
  mostrarContratista, setMostrarContratista,
  superintendenteNombre,
  setSuperintendenteNombre,
  zonaFooterStr, 
  zonaLocationStr
}) => {
  const [usarReglaFecha, setUsarReglaFecha] = useState<boolean>(true);

  if (!previewData) return null;

  const handlePrint = () => {
    if (!previewData) return;
    try {
      const dateText = formatDateSpanish(new Date().toISOString().slice(0, 10));
      const consecutivo = previewData.numeroOficio
        ? previewData.numeroOficio
        : previewData.oficioConsecutivo 
          ? `CONS. ZONA -${String(previewData.oficioConsecutivo).padStart(4, '0')}/${previewData.anio || '2026'}`
          : 'CONS. ZONA -0000/2026';
      
      const superintendente = (superintendenteNombre || 'N/A').toUpperCase();
      const contrato = previewData.contrato || 'N/A';
      const rd = previewData.rd || 'N/A';
      
      const at = previewData.at || 'N/A';
      const activo = previewData.activo || 'N/A';
      const orden = previewData.orden || 'N/A';
      const atRetiro = previewData.atRetiro || '-';
      const siadRetiro = previewData.siadRetiro || '-';
      const or = previewData.ordenRetiro || '-';

      const fechaConciliacionText = formatDateSpanish(getFechaConciliacion(previewData.fechaCapitalizacion, previewData.fechaTerminoCampo, usarReglaFecha));

      const printHtml = `
        <html>
          <head>
            <title>Conciliación de Obra</title>
            <style>
              @page { size: letter; margin: 0; }
              body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; color: #212121; font-size: 13px; line-height: 1.5; position: relative; width: 8.5in; height: 11in; box-sizing: border-box; }
              .background-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
              .background-container img { width: 100%; height: 100%; object-fit: fill; }
              .content { padding-top: 150px; padding-left: 70px; padding-right: 70px; padding-bottom: 120px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; position: relative; z-index: 1; }
              .right-meta { text-align: right; font-weight: bold; font-size: 13px; margin-bottom: 2px; }
              .right-meta.asunto { margin-bottom: 25px; }
              .date-line { font-size: 13px; margin-bottom: 30px; }
              .recipient { font-size: 13px; margin-bottom: 25px; line-height: 1.4; }
              .recipient-name { font-weight: bold; }
              .body-paragraph { text-align: justify; font-size: 13px; margin-bottom: 20px; text-justify: inter-word; }
              .footer-address { position: absolute; bottom: 50px; left: 220px; right: 70px; font-size: 10px; color: #b35a6f; text-align: center; line-height: 1.4; white-space: nowrap; }
            </style>
          </head>
          <body>
            <div class="background-container"><img src="/membrete.png" alt="Membrete" /></div>
            <div class="content">              <div class="right-meta asunto">Asunto: Conciliación de Obra</div>
              <div class="date-line" style="text-align: right;">${zonaLocationStr}, ${dateText}</div>
              <div class="recipient">
                <div class="recipient-name">${adminNombre.toUpperCase()}</div>
                <div>${adminCargo}</div>
                <div>${adminZona}</div>
              </div>
              <div class="body-paragraph" style="text-align: justify; text-justify: inter-word;">
                Por medio del presente le informo a usted, que la R.D. <strong>${rd}</strong> con número de AT <strong>${at}</strong>, número de activo <strong>${activo}</strong> y número orden <strong>${orden}</strong>, construida bajo el amparo del contrato <strong>${contrato}</strong> quedo conciliada el día <strong>${fechaConciliacionText}</strong>, por lo anterior solicitamos que a partir de recibir el presente no se afecte ningún movimiento de materiales con cargo al activo de la obra.
              </div>
              <div class="body-paragraph" style="text-align: justify; text-justify: inter-word;">
                Adicionalmente le informo que la empresa contratista responsable de la construcción de la obra no tiene ninguna inconformidad con lo indicado, firmando de consentimiento el presente documento.<br />
                Sin más por el momento, le envío un cordial saludo.
              </div>
              
              <div style="display: flex; flex-direction: column; align-items: center; margin-top: auto; margin-bottom: calc(20px + 3cm); width: 100%;">
                 ${mostrarSupervisor ? `
                 <div style="text-align: center; margin-bottom: 50px; width: 100%;">
                    <div style="font-weight: bold; margin-bottom: 30px; letter-spacing: 2px; font-size: 13px;">A t e n t a m e n t e</div>
                   <div style="border-top: 1px solid #000; width: 220px; margin: 0 auto 5px auto;"></div>
                   <div style="font-weight: bold; font-size: 11px;">${supervisorNombre}</div>
                   <div style="font-size: 10px;">${supervisorCargo}</div>
                 </div>
                 ` : ''}

                 <div style="display: flex; justify-content: space-between; width: 100%;">
                   ${mostrarAdmin ? `
                   <div style="text-align: center; width: 45%;">
                     <div style="border-top: 1px solid #000; width: 180px; margin: 0 auto 5px auto;"></div>
                     <div style="font-weight: bold; font-size: 11px;">${adminNombre}</div>
                     <div style="font-size: 10px;">${adminCargo}</div>
                   </div>
                   ` : ''}
                   
                   ${mostrarContratista ? `
                   <div style="text-align: center; width: 45%;">
                     <div style="border-top: 1px solid #000; width: 180px; margin: 0 auto 5px auto;"></div>
                     <div style="font-weight: bold; font-size: 11px;">${superintendente}</div>
                     <div style="font-size: 10px;">Superintendente de Construcción</div>
                   </div>
                   ` : ''}
                 </div>
               </div>        </div>
              <div class="footer-address">${zonaFooterStr}</div>
            </div>
            <script>
              setTimeout(() => {
                window.focus();
                window.print();
              }, 500);
            </script>
          </body>
        </html>
      `;
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '1200px';
      iframe.style.height = '800px';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printHtml);
        doc.close();
      }
      
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    } catch (err) {
      console.error('Error al generar la conciliación:', err);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <span>Vista Previa: Conciliación de Obra</span>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={usarReglaFecha}
                onChange={(e) => setUsarReglaFecha(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: usarReglaFecha ? '#15803d' : '#64748b' }}>
                {usarReglaFecha ? 'Regla Fecha (+19d): SÍ' : 'Regla Fecha: NO (Hoy)'}
              </Typography>
            }
            sx={{ m: 0, ml: 1, backgroundColor: '#f8fafc', px: 1.2, py: 0.3, borderRadius: '20px', border: '1px solid #cbd5e1' }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Previsualización del Documento (A4) */}
          <Grid item xs={12}>
            <Box sx={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ transform: { xs: 'scale(0.5)', md: 'scale(0.7)' }, transformOrigin: 'top center', mb: { xs: -150, md: -80 } }}>
                <Box
                  id="printable-area-conciliacion"
                sx={{
                  width: '210mm',
                  height: '297mm',
                  backgroundColor: '#fff',
                  backgroundImage: 'url(/membrete.png)',
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  border: '1px solid #ccc',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  p: '150px 70px 120px 70px',
                  fontFamily: 'Arial, sans-serif',
                  color: '#212121',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'right', fontWeight: 'bold', fontSize: '13px', mb: '25px' }}>
                    Asunto: Conciliación de Obra
                  </Box>
                  <Box sx={{ textAlign: 'right', fontSize: '13px', mb: '30px' }}>
                    {zonaLocationStr}, {formatDateSpanish(getFechaConciliacion(previewData.fechaCapitalizacion, previewData.fechaTerminoCampo, usarReglaFecha))}
                  </Box>
                  <Box sx={{ fontSize: '13px', mb: '25px', lineHeight: '1.4' }}>
                    <Box component="div" sx={{ fontWeight: 'bold' }}>{adminNombre.toUpperCase()}</Box>
                    <Box component="div">{adminCargo}</Box>
                    <Box component="div">{adminZona}</Box>
                  </Box>
                  <Box sx={{ textAlign: 'justify', fontSize: '13px', mb: '20px', textJustify: 'inter-word' }}>
                    Por medio del presente le informo a usted, que la R.D. <strong>{previewData.rd || 'N/A'}</strong> con número de AT <strong>{previewData.at || 'N/A'}</strong>, número de activo <strong>{previewData.activo || 'N/A'}</strong> y número orden <strong>{previewData.orden || 'N/A'}</strong>, construida bajo el amparo del contrato <strong>{previewData.contrato || 'N/A'}</strong> quedo conciliada el día <strong>{formatDateSpanish(getFechaConciliacion(previewData.fechaCapitalizacion, previewData.fechaTerminoCampo, usarReglaFecha))}</strong>, por lo anterior solicitamos que a partir de recibir el presente no se afecte ningún movimiento de materiales con cargo al activo de la obra.
                  </Box>
                  <Box sx={{ textAlign: 'justify', fontSize: '13px', mb: '20px', textJustify: 'inter-word' }}>
                    Adicionalmente le informo que la empresa contratista responsable de la construcción de la obra no tiene ninguna inconformidad con lo indicado, firmando de consentimiento el presente documento.<br />
                    Sin más por el momento, le envío un cordial saludo.
                  </Box>

                  {/* Firmas Conciliacion */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 'auto', mb: 'calc(16px + 3cm)', width: '100%' }}>
                    {mostrarSupervisor && (
                      <Box sx={{ textAlign: 'center', mb: '50px', width: '100%' }}>
                        <Box sx={{ fontWeight: 'bold', mb: 4, letterSpacing: '2px', fontSize: '13px' }}>A t e n t a m e n t e</Box>
                        <Box sx={{ borderTop: '1px solid #000', width: '220px', margin: '0 auto 5px auto' }} />
                        <Box sx={{ fontWeight: 'bold', fontSize: '11px' }}>{supervisorNombre}</Box>
                        <Box sx={{ fontSize: '11px' }}>{supervisorCargo}</Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                      {mostrarAdmin && (
                        <Box sx={{ textAlign: 'center', width: '45%' }}>
                          <Box sx={{ borderTop: '1px solid #000', width: '180px', margin: '0 auto 5px auto' }} />
                          <Box sx={{ fontWeight: 'bold', fontSize: '11px' }}>{adminNombre}</Box>
                          <Box sx={{ fontSize: '11px' }}>{adminCargo}</Box>
                        </Box>
                      )}
                      
                      {mostrarContratista && (
                        <Box sx={{ textAlign: 'center', width: '45%' }}>
                          <Box sx={{ borderTop: '1px solid #000', width: '180px', margin: '0 auto 5px auto' }} />
                          <Box sx={{ fontWeight: 'bold', fontSize: '11px' }}>{(superintendenteNombre || 'N/A').toUpperCase()}</Box>
                          <Box sx={{ fontSize: '11px' }}>Superintendente de Construcción</Box>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box 
                    sx={{ position: 'absolute', bottom: '-70px', left: '220px', right: '70px', fontSize: '10px', color: '#b35a6f', textAlign: 'center', lineHeight: 1.4, whiteSpace: 'nowrap' }}
                    dangerouslySetInnerHTML={{ __html: zonaFooterStr }} 
                  />
                </Box>
              </Box>
            </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #ddd', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          size="small"
          variant={usarReglaFecha ? "contained" : "outlined"}
          color={usarReglaFecha ? "success" : "warning"}
          onClick={() => setUsarReglaFecha(!usarReglaFecha)}
          sx={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}
        >
          {usarReglaFecha ? '⚡ Regla Fecha (+19d): ACTIVADA' : '📅 Usar Fecha de Hoy'}
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handlePrint} 
            variant="contained" 
            color="primary"
            startIcon={<PrintIcon />}
          >
            Imprimir Documento
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
