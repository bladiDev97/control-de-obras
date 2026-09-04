import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { ConfiguracionFirmas } from './ConfiguracionFirmas';
import { formatDateSpanish } from '../utils/reportesUtils';

interface OficioPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  previewData: any;
  handlePrintConfirm?: () => void;

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

  contratistaNombre: string;
  contratistaDomicilio: string;
  superintendenteNombre: string;

  zonaFooterStr: string;
  zonaLocationStr: string;
}

export const OficioPreviewDialog: React.FC<OficioPreviewDialogProps> = ({
  open, onClose, previewData,
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
  contratistaNombre, contratistaDomicilio, superintendenteNombre,
  zonaFooterStr, zonaLocationStr
}) => {
  if (!previewData) return null;

  const handlePrint = () => {
    if (!previewData) return;
    try {
      const dateText = formatDateSpanish(previewData.fechaAsignacion || new Date().toISOString().slice(0, 10));
      const limitDateText = formatDateSpanish(previewData.fechaFinConstruccion || '');
      const consecutivo = previewData.numeroOficio
        ? previewData.numeroOficio
        : previewData.oficioConsecutivo
          ? `CONS. ZONA -${String(previewData.oficioConsecutivo).padStart(4, '0')}/${previewData.anio || '2026'}`
          : 'CONS. ZONA -0000/2026';

      const contratista = (contratistaNombre === 'N/A' || !contratistaNombre ? 'GCPM COMUNICACIONES' : contratistaNombre).toUpperCase();
      const domicilio = (contratistaDomicilio === 'N/A' || !contratistaDomicilio ? 'Calle Luis Moya No. 105 H2, Col. Centro, C.P. 58000, Morelia, Mich. tel.: 443 4530752.' : contratistaDomicilio).toUpperCase();
      const superintendente = (superintendenteNombre || 'N/A').toUpperCase();
      const contrato = previewData.contrato || 'N/A';
      const solicitante = (previewData.nombreSolicitante || 'N/A').toUpperCase();
      const municipio = (previewData.municipio || 'PÁTZCUARO').toUpperCase();
      const rd = previewData.poblacion || (previewData.rd ? previewData.rd.replace(/\s*municipio\s+de\s+.*$/i, '') : 'N/A');

      const at = previewData.at || '-';
      const siad = previewData.obra || '-'; // Obra field usually contains SIAD
      const activo = previewData.activo || '-';
      const orden = previewData.orden || '-';
      const atRetiro = previewData.atRetiro || '-';
      const siadRetiro = previewData.siadRetiro || '-';
      const or = previewData.ordenRetiro || '-';

      const printHtml = `
        <html>
          <head>
            <title>${consecutivo}</title>
            <style>
              @page { size: letter; margin: 0; }
              body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; color: #212121; font-size: 13px; line-height: 1.5; position: relative; width: 100%; height: 100%; box-sizing: border-box; }
              .background-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
              .background-container img { width: 100%; height: 100%; object-fit: fill; }
              .content { padding-top: 150px; padding-left: 70px; padding-right: 70px; padding-bottom: 120px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; }
              .right-meta { text-align: right; font-weight: normal; font-size: 13px; margin-bottom: 2px; }
              .right-meta.asunto { font-weight: bold; margin-bottom: 25px; }
              .date-line { font-size: 13px; margin-bottom: 30px; text-align: left; margin-left: 10px; }
              .recipient { font-size: 13px; margin-bottom: 25px; line-height: 1.4; }
              .recipient-name { font-weight: bold; }
              .body-paragraph { text-align: justify; font-size: 13px; margin-bottom: 20px; text-justify: inter-word; }
              .table-container { margin-bottom: 20px; width: 100%; display: flex; justify-content: center; }
              table { border-collapse: collapse; text-align: center; width: 100%; font-size: 13px; }
              th, td { border: 1px solid #000; padding: 5px; font-weight: normal; vertical-align: middle; }
              .signature-section { margin-top: auto; width: 100%; text-align: center; margin-bottom: calc(20px + 3cm); }
              .footer-address { position: absolute; bottom: 50px; left: 220px; right: 70px; font-size: 10px; color: #b35a6f; text-align: center; line-height: 1.4; white-space: nowrap; }
            </style>
          </head>
          <body>
            <div class="background-container"><img src="/membrete.png" alt="Membrete" /></div>
            <div class="content">
              <div class="right-meta">Oficio Núm. ${consecutivo}</div>
              <div class="right-meta asunto">Asunto: Oficio de inicio de obra</div>
              <div class="date-line">${zonaLocationStr}, ${dateText}</div>
              
              <div class="recipient">
                <div class="recipient-name">${contratista}</div>
                <div>${domicilio}</div>
              </div>
              
              <div class="body-paragraph">
                De conformidad con la Disposición 93 de las Disposiciones Generales en materia de adquisiciones, arrendamientos, contratación de servicios y ejecución de obras de la Comisión Federal de Electricidad y sus empresas productivas subsidiarias, así como a lo establecido en las especificaciones CFE DCCIAMBT para la construcción de Líneas y Redes de Distribución Áreas y Subterráneas, relacionadas con el contrato de Obra Pública No. ${contrato}, suscrito con su empresa, en el cual se amparan los trabajos: Construcción de obras en Zona Pátzcuaro, solicito a usted iniciar los trabajos de construcción de la siguiente obra: <strong>R.D. ${rd}</strong> del municipio de <strong>${municipio}</strong> a nombre del SR. <strong>${solicitante}</strong>.
              </div>

              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>AT</th>
                      <th>SIAD</th>
                      <th>ACTIVO</th>
                      <th>ORDEN</th>
                      <th>AT<br/>RETIRO</th>
                      <th>SIAD<br/>RETIRO</th>
                      <th>OR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${at}</td>
                      <td>${siad}</td>
                      <td>${activo}</td>
                      <td>${orden}</td>
                      <td>${atRetiro}</td>
                      <td>${siadRetiro}</td>
                      <td>${or}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="body-paragraph">
                La cual deberá quedar terminada a más tardar en la siguiente fecha: ${limitDateText}.<br/>
                Se adjunta al presente, plano del proyecto.<br/>
                Sin otro particular de momento, quedo de Usted.
              </div>

              ${mostrarSupervisor ? `
              <div class="signature-section">
                <div style="font-weight: bold; margin-bottom: 30px; letter-spacing: 2px; font-size: 13px;">A t e n t a m e n t e</div>
                <div style="font-weight: bold; font-size: 13px;">${supervisorNombre}</div>
                <div style="font-size: 13px;">${supervisorCargo}</div>
                <div>${supervisorZona}</div>
              </div>
              ` : ''}

              <div class="footer-address">
                ${zonaFooterStr}
              </div>
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
      console.error('Error al generar el oficio:', err);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Vista Previa: Oficio de Inicio de Obra
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
                  id="printable-area"
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
                    color: '#000',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ textAlign: 'right', fontSize: '13px', mb: '2px' }}>
                      Oficio Núm. {previewData.numeroOficio || (previewData.oficioConsecutivo ? `CONS. ZONA -${String(previewData.oficioConsecutivo).padStart(4, '0')}/${previewData.anio || '2026'}` : '-')}
                    </Box>
                    <Box sx={{ textAlign: 'right', fontWeight: 'bold', fontSize: '13px', mb: '25px' }}>
                      Asunto: Oficio de inicio de obra
                    </Box>

                    <Box sx={{ fontSize: '13px', mb: '30px', ml: 1 }}>
                      {zonaLocationStr}, {formatDateSpanish(previewData.fechaAsignacion || '')}
                    </Box>

                    <Box sx={{ fontSize: '13px', mb: '25px', lineHeight: '1.4' }}>
                      <Box component="div" sx={{ fontWeight: 'bold' }}>
                        {contratistaNombre === 'N/A' || !contratistaNombre ? 'GCPM COMUNICACIONES' : contratistaNombre}
                      </Box>
                      <Box component="div">
                        {contratistaDomicilio === 'N/A' || !contratistaDomicilio ? 'Calle Luis Moya No. 105 H2, Col. Centro, C.P. 58000, Morelia, Mich. tel.: 443 4530752.' : contratistaDomicilio}
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'justify', fontSize: '13px', mb: '20px' }}>
                      De conformidad con la Disposición 93 de las Disposiciones Generales en materia de adquisiciones, arrendamientos, contratación de servicios y ejecución de obras de la Comisión Federal de Electricidad y sus empresas productivas subsidiarias, así como a lo establecido en las especificaciones CFE DCCIAMBT para la construcción de Líneas y Redes de Distribución Áreas y Subterráneas, relacionadas con el contrato de Obra Pública No. {previewData.contrato || '-'}, suscrito con su empresa, en el cual se amparan los trabajos: Construcción de obras en Zona Pátzcuaro, solicito a usted iniciar los trabajos de construcción de la siguiente obra: <strong>R.D. {previewData.poblacion || '-'}</strong> del municipio de <strong>{(previewData.municipio || 'PÁTZCUARO').toUpperCase()}</strong> a nombre del SR. <strong>{(previewData.nombreSolicitante || 'N/A').toUpperCase()}</strong>.
                    </Box>

                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: '20px' }}>
                      <table style={{ borderCollapse: 'collapse', textAlign: 'center', width: '100%', fontSize: '13px' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid #000', padding: '5px', fontWeight: 'normal', verticalAlign: 'middle' }}>AT</th>
                            <th style={{ border: '1px solid #000', padding: '5px', fontWeight: 'normal', verticalAlign: 'middle' }}>SIAD</th>
                            <th style={{ border: '1px solid #000', padding: '5px', fontWeight: 'normal', verticalAlign: 'middle' }}>ACTIVO</th>
                            <th style={{ border: '1px solid #000', padding: '5px', fontWeight: 'normal', verticalAlign: 'middle' }}>ORDEN</th>
                            <th style={{ border: '1px solid #000', padding: '5px', fontWeight: 'normal', verticalAlign: 'middle' }}>AT<br />RETIRO</th>
                            <th style={{ border: '1px solid #000', padding: '5px', fontWeight: 'normal', verticalAlign: 'middle' }}>SIAD<br />RETIRO</th>
                            <th style={{ border: '1px solid #000', padding: '5px', fontWeight: 'normal', verticalAlign: 'middle' }}>OR</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{previewData.at || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{previewData.obra || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{previewData.activo || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{previewData.orden || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{previewData.atRetiro || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{previewData.siadRetiro || '-'}</td>
                            <td style={{ border: '1px solid #000', padding: '5px' }}>{previewData.ordenRetiro || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>

                    <Box sx={{ fontSize: '13px', mb: '20px' }}>
                      La cual deberá quedar terminada a más tardar en la siguiente fecha: {formatDateSpanish(previewData.fechaFinConstruccion || '')}.<br />
                      Se adjunta al presente, plano del proyecto.<br />
                      Sin otro particular de momento, quedo de Usted.
                    </Box>

                    {mostrarSupervisor && (
                      <Box sx={{ textAlign: 'center', mt: 'auto', mb: 'calc(16px + 3cm)' }}>
                        <Box sx={{ fontWeight: 'bold', mb: 4, letterSpacing: '2px', fontSize: '13px' }}>A t e n t a m e n t e</Box>
                        <Box sx={{ fontWeight: 'bold', fontSize: '13px' }}>{supervisorNombre}</Box>
                        <Box sx={{ fontSize: '13px' }}>{supervisorCargo}</Box>
                        <Box sx={{ fontSize: '13px' }}>{supervisorZona}</Box>
                      </Box>
                    )}

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
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
        >
          Imprimir Documento
        </Button>
      </DialogActions>
    </Dialog>
  );
};
