import React, { useEffect, useState } from 'react';
import { 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  CircularProgress, 
  IconButton, 
  Alert,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Switch
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { Obra } from '../../obras/types/obra.types';
import { obrasService } from '../../obras/services/obras.service';
import { personalService } from '../../personal/services/personal.service';
import { contratosService } from '../../contratos/services/contratos.service';
import ReusableTable, { Column } from '../../../components/Table/ReusableTable';
import { OficioPreviewDialog } from '../components/OficioPreviewDialog';
import { ConciliacionPreviewDialog } from '../components/ConciliacionPreviewDialog';

import { AvisoSuspensionTab } from '../components/AvisoSuspensionTab';
import { AvisoSuspensionMtTab } from '../components/AvisoSuspensionMtTab';
import { EtiquetasTab } from '../components/EtiquetasTab';
import { useEtiquetas } from '../hooks/useEtiquetas';
import { getFechaConciliacion } from '../utils/reportesUtils';

export default function ReportesPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // States for print preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewType, setPreviewType] = useState<'oficio' | 'conciliacion'>('oficio');

  // Tab State
  const [activeTab, setActiveTab] = useState<'asignacion' | 'conciliacion' | 'suspension' | 'suspensionMt' | 'etiquetas'>('asignacion');

  // Custom signature configuration states
  const [supervisorNombre, setSupervisorNombre] = useState('MARCOS BLADIMIR ROMERO PÉREZ');
  const [supervisorRpe, setSupervisorRpe] = useState('9NGB3');
  const [mostrarSupervisor, setMostrarSupervisor] = useState(true);

  const [adminNombre, setAdminNombre] = useState('EUGENIO HEREDIA CHÁVEZ');
  const [adminRpe, setAdminRpe] = useState('9048U');
  const [mostrarAdmin, setMostrarAdmin] = useState(true);

  const [supervisorCargo, setSupervisorCargo] = useState('Supervisor de Obra');
  const [supervisorZona, setSupervisorZona] = useState('Constructora Zona Pátzcuaro');

  const [adminCargo, setAdminCargo] = useState('Administrador de Zona');
  const [adminZona, setAdminZona] = useState('Zona Pátzcuaro');

  const [mostrarContratista, setMostrarContratista] = useState(true);
  const [contratistaNombre, setContratistaNombre] = useState('N/A');
  const [contratistaDomicilio, setContratistaDomicilio] = useState('N/A');
  const [superintendenteNombre, setSuperintendenteNombre] = useState('N/A');
  
  const zonaFooterStr = 'Libramiento Ignacio Zaragoza no.1409, Colonia Centro, Pátzcuaro, Michoacán, México<br />C.P. 61600 Tel. 434 34 2 87 59, ext. 21759';
  const zonaLocationStr = 'Pátzcuaro, Mich.';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [data, contratosList, personnel] = await Promise.all([
          obrasService.getAll(),
          contratosService.getAll(),
          personalService.getAll(),
        ]);
        
        // Only show works that have been assigned (have a contract)
        const assignedObras = data.filter((o) => o.contrato && o.contrato.trim() !== '');
        setObras(assignedObras);
        setContratos(contratosList);
        
        const supervisor = personnel.find(p => p.cargo.toLowerCase().includes('supervisor'));
        if (supervisor) {
          setSupervisorNombre(`${supervisor.nombres} ${supervisor.apellidoPaterno} ${supervisor.apellidoMaterno || ''}`.trim().toUpperCase());
          setSupervisorRpe(supervisor.rpe);
          setSupervisorCargo(supervisor.cargo);
          setSupervisorZona(supervisor.zona || 'Constructora Zona Pátzcuaro');
        }
        
        const admin = personnel.find(p => p.cargo.toLowerCase().includes('administrador'));
        if (admin) {
          setAdminNombre(`${admin.nombres} ${admin.apellidoPaterno} ${admin.apellidoMaterno || ''}`.trim().toUpperCase());
          setAdminRpe(admin.rpe);
          setAdminCargo(admin.cargo);
          setAdminZona(admin.zona || 'Zona Pátzcuaro');
        }
      } catch (err) {
        console.error('Error cargando datos para reportes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const { selectedIds, handleSelect, handlePrint: handlePrintEtiquetas } = useEtiquetas();

  const etiquetasColumns: Column<Obra>[] = [
    {
      key: 'id',
      label: 'Seleccionar',
      render: (row: Obra) => (
        <Checkbox
          checked={selectedIds.includes(row.id)}
          onChange={(e) => handleSelect(row.id, e.target.checked)}
        />
      )
    },
    { key: 'at', label: 'AT' },
    { key: 'rd', label: 'RD', render: (row: Obra) => row.rd || '-' },
    { key: 'obra', label: 'OBRA' },
    { key: 'activo', label: 'ACTIVO' },
    { key: 'orden', label: 'ORDEN' },
    { key: 'contratista', label: 'CONTRATISTA' }
  ];

  const handleOpenPreview = async (obraId: string, type: 'oficio' | 'conciliacion') => {
    setPreviewType(type);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const detail = await obrasService.getOficio(obraId);
      
      let resolvedContratista = detail.contratista || '';
      let resolvedDomicilio = detail.domicilioContratista || '';
      
      if (detail.contrato) {
        const matchedContrato = contratos.find(c => String(c.numeroContrato).trim() === String(detail.contrato).trim());
        if (matchedContrato) {
          if (!resolvedContratista || resolvedContratista === 'N/A') {
            resolvedContratista = matchedContrato.contratista || '';
          }
          if (!resolvedDomicilio || resolvedDomicilio === 'N/A') {
            resolvedDomicilio = matchedContrato.direccion || '';
          }
        }
      }
      
      let resolvedSuperintendente = '';
      if (detail.contrato) {
        const matchedContrato = contratos.find(c => String(c.numeroContrato).trim() === String(detail.contrato).trim());
        if (matchedContrato) {
          resolvedSuperintendente = matchedContrato.residenteObra || '';
        }
      }

      setContratistaNombre(resolvedContratista || 'N/A');
      setContratistaDomicilio(resolvedDomicilio || 'N/A');
      setSuperintendenteNombre(resolvedSuperintendente || 'N/A');
      setPreviewData(detail);
    } catch (err) {
      console.error('Error al cargar la previsualización:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const formatLongDate = (dateStr?: string) => {
    if (!dateStr) dateStr = new Date().toISOString().slice(0, 10);
    try {
      // Remove any trailing dot or spaces and extract the date part
      const datePart = dateStr.split('T')[0].replace(/\.+$/, '').trim();
      let parts: string[] = [];
      if (datePart.includes('-')) {
        parts = datePart.split('-');
      } else if (datePart.includes('/')) {
        parts = datePart.split('/');
      } else if (datePart.includes('.')) {
        parts = datePart.split('.');
      }

      if (parts.length !== 3) return dateStr;
      
      let year = parts[0];
      let monthIndex = parseInt(parts[1], 10) - 1;
      let day = parseInt(parts[2], 10);
      
      if (year.length < 4) {
        if (parts[2].length === 4) {
          year = parts[2];
          day = parseInt(parts[0], 10);
        } else {
          return dateStr;
        }
      }
      
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      if (monthIndex < 0 || monthIndex >= 12 || isNaN(day) || isNaN(monthIndex)) {
        return dateStr;
      }
      
      return `${day} de ${months[monthIndex]} de ${year}`;
    } catch {
      return dateStr;
    }
  }



  const handlePrint = (detail: any, type: 'oficio' | 'conciliacion') => {
    if (!detail) return;
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const dateText = formatLongDate(type === 'oficio' ? detail.fechaAsignacion : new Date().toISOString().slice(0, 10));
      const limitDateText = formatLongDate(detail.fechaFinConstruccion);
      const consecutivo = detail.numeroOficio 
        ? detail.numeroOficio
        : detail.oficioConsecutivo 
          ? `CONS. ZONA -${String(detail.oficioConsecutivo).padStart(4, '0')}/${detail.anio || '2026'}`
          : 'CONS. ZONA -0000/2026';
      
      const contratista = (contratistaNombre || 'N/A').toUpperCase();
      const domicilio = (contratistaDomicilio || 'N/A').toUpperCase();
      const superintendente = (superintendenteNombre || 'N/A').toUpperCase();
      const contrato = detail.contrato || 'N/A';
      const obraDesc = detail.obra || 'N/A';
      const rd = detail.rd || 'N/A';
      const solicitante = (detail.nombreSolicitante || 'N/A').toUpperCase();
      const poblacion = detail.poblacion || '';
      const municipio = detail.municipio || 'PÁTZCUARO';

      const at = detail.at || 'N/A';
      const siad = detail.obra || 'N/A';
      const activo = detail.activo || 'N/A';
      const orden = detail.orden || 'N/A';
      const atRetiro = detail.atRetiro || '-';
      const siadRetiro = detail.siadRetiro || '-';
      const or = detail.ordenRetiro || '-';

      const fechaConciliacion = getFechaConciliacion(detail.fechaCapitalizacion, detail.fechaTerminoCampo);
      const fechaConciliacionText = formatLongDate(fechaConciliacion || detail.fechaCapitalizacion);

      printWindow.document.write(`
        <html>
          <head>
            <title>${type === 'oficio' ? consecutivo : 'Conciliación de Obra'}</title>
            <style>
              @page {
                size: letter;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                color: #212121;
                font-size: 13px;
                line-height: 1.5;
                position: relative;
                width: 8.5in;
                height: 11in;
                box-sizing: border-box;
              }
              .background-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
              }
              .background-container img {
                width: 100%;
                height: 100%;
                object-fit: fill;
              }
              .content {
                padding-top: 160px;
                padding-left: 70px;
                padding-right: 70px;
                padding-bottom: 120px;
                display: flex;
                flex-direction: column;
                height: 100%;
                box-sizing: border-box;
              }
              .right-meta {
                text-align: right;
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 2px;
              }
              .right-meta.asunto {
                margin-bottom: 25px;
              }
              .date-line {
                font-size: 13px;
                margin-bottom: 30px;
              }
              .recipient {
                font-size: 13px;
                margin-bottom: 25px;
                line-height: 1.4;
              }
              .recipient-name {
                font-weight: bold;
              }
              .body-paragraph {
                text-align: justify;
                font-size: 13px;
                margin-bottom: 20px;
                text-justify: inter-word;
              }
              .data-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 11px;
              }
              .data-table th, .data-table td {
                border: 1px solid #757575;
                padding: 6px 4px;
                text-align: center;
              }
              .data-table th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              .closing {
                font-size: 13px;
                margin-bottom: 35px;
              }
              .signature-section {
                text-align: center;
                margin-top: auto;
                margin-bottom: 40px;
              }
              .signature-title {
                font-weight: bold;
                margin-bottom: 50px;
              }
              .signature-name {
                font-weight: bold;
              }
              .footer-address {
                position: absolute;
                bottom: 35px;
                left: 220px;
                right: 70px;
                text-align: center;
                font-size: 10px;
                color: #212121;
                line-height: 1.4;
              }
            </style>
          </head>
          <body>
            <div class="background-container">
              <img src="/membrete.png" alt="CFE Membrete" />
            </div>
            
            ${type === 'oficio' ? `
            <div class="content">
              <div class="right-meta">${consecutivo}</div>
              <div class="right-meta asunto">Asunto: Oficio de inicio de obra</div>
              
              <div class="date-line">Pátzcuaro, Mich., a ${dateText}.</div>

              <div class="recipient">
                <div class="recipient-name">${contratista}</div>
                <div>${domicilio}</div>
              </div>

              <div class="body-paragraph">
                De conformidad con la Disposición 93 de las Disposiciones Generales en materia de adquisiciones, arrendamientos, contratación de servicios y ejecución de obras de la Comisión Federal de Electricidad y sus empresas productivas subsidiarias, así como a lo establecido en las especificaciones CFE DCCIAMBT para la construcción de Líneas y Redes de Distribución Áreas y Subterráneas, relacionadas con el contrato de Obra Pública No. <strong>${contrato}</strong>, suscrito con su empresa, en el cual se amparan los trabajos: <strong>${obraDesc}</strong> en Zona Pátzcuaro, solicito a usted iniciar los trabajos de construcción de la siguiente obra: <strong>R.D. ${rd}</strong> del municipio de <strong>${municipio}</strong>${poblacion ? `, población de <strong>${poblacion}</strong>` : ''} a nombre del Sr. <strong>${solicitante}</strong>
              </div>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>AT</th>
                    <th>SIAD</th>
                    <th>ACTIVO</th>
                    <th>ORDEN</th>
                    <th>AT RETIRO</th>
                    <th>SIAD RETIRO</th>
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

              <div class="body-paragraph">
                La cual deberá quedar terminada a más tardar en la siguiente fecha: <strong>${limitDateText}</strong>.<br />
                Se adjunta al presente, plano del proyecto.<br />
                Sin otro particular de momento, quedo de Usted.
              </div>

              ${mostrarSupervisor ? `
              <div class="signature-section">
                <div class="signature-title">A t e n t a m e n t e</div>
                <div class="signature-name">${supervisorNombre}</div>
                <div>RPE: ${supervisorRpe}</div>
                <div>${supervisorCargo}</div>
                <div>${supervisorZona}</div>
              </div>
              ` : ''}
            </div>
            ` : `
            <div class="content">
              <div class="right-meta">${consecutivo}</div>
              <div class="right-meta asunto" style="margin-top: 25px; margin-bottom: 25px;">Asunto: Conciliación de Obra</div>
              
              <div class="date-line" style="margin-bottom: 30px;">Pátzcuaro, Mich., a ${dateText}.</div>

              <div class="recipient" style="margin-bottom: 30px;">
                <div class="recipient-name">${adminNombre.toUpperCase()}</div>
                <div>${adminCargo}</div>
                <div>${adminZona}</div>
              </div>

              <div class="body-paragraph" style="margin-bottom: 25px;">
                Por medio del presente le informo a usted, que la R.D. <strong>${rd}</strong> con número de AT <strong>${at}</strong>, número de activo <strong>${activo}</strong> y número orden <strong>${orden}</strong>, construida bajo el amparo del contrato <strong>${contrato}</strong> quedo conciliada el día <strong>${fechaConciliacionText}</strong>, por lo anterior solicitamos que a partir de recibir el presente no se afecte ningún movimiento de materiales con cargo al activo de la obra.
              </div>

              <div class="body-paragraph" style="margin-bottom: 35px;">
                Adicionalmente le informo que la empresa contratista responsable de la construcción de la obra no tiene ninguna inconformidad con lo indicado, firmando de consentimiento el presente documento.<br />
                Sin más por el momento, le envío un cordial saludo.
              </div>

               <div style="display: flex; flex-direction: column; align-items: center; margin-top: auto; margin-bottom: 20px; width: 100%;">
                 <!-- Center/Top: Supervisor (Atentamente) -->
                 ${mostrarSupervisor ? `
                 <div style="text-align: center; margin-bottom: 50px; width: 100%;">
                    <div style="font-weight: bold; margin-bottom: 35px; font-size: 14px; letter-spacing: 1px;">Atentamente</div>
                   <div style="border-top: 1px solid #000; width: 220px; margin: 0 auto 5px auto;"></div>
                   <div style="font-weight: bold; font-size: 11px;">${supervisorNombre}</div>
                   <div style="font-size: 10px;">RPE: ${supervisorRpe}</div>
                   <div style="font-size: 10px;">${supervisorCargo}</div>
                   <div style="font-size: 10px;">${supervisorZona}</div>
                 </div>
                 ` : ''}
                   <div style="text-align: center; width: 45%;">
                     ${mostrarAdmin ? `
                     <div style="border-top: 1px solid #000; width: 180px; margin: 0 auto 5px auto;"></div>
                     <div style="font-weight: bold; font-size: 11px;">${adminNombre}</div>
                     <div style="font-size: 10px;">RPE: ${adminRpe}</div>
                     <div style="font-size: 10px;">${adminCargo}</div>
                     <div style="font-size: 10px;">${adminZona}</div>
                     ` : ''}
                   </div>
                   
                   <!-- Right: Superintendente -->
                   <div style="text-align: center; width: 45%;">
                     ${mostrarContratista ? `
                     <div style="border-top: 1px solid #000; width: 180px; margin: 0 auto 5px auto;"></div>
                     <div style="font-weight: bold; font-size: 11px;">${superintendente}</div>
                     <div style="font-size: 10px;">SUPERINTENDENTE DE OBRA</div>
                     ` : ''}
                   </div>
                 </div>
               </div>
            </div>
            `}

            <div class="footer-address">
              Libramiento Ignacio Zaragoza no.1409, Colonia Centro, Pátzcuaro, Michoacán, México<br />
              C.P. 61600 Tel. 434 34 2 87 59, ext. 21759
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
    } catch (err) {
      console.error('Error al generar el oficio:', err);
    }
  }

  const handlePrintConfirm = () => {
    if (previewData) {
      handlePrint(previewData, previewType);
    }
  };


  const tableColumns: Column<Obra>[] = [
    { key: 'solicitudPo', label: 'Solicitud/PO' },
    { key: 'at', label: 'AT' },
    { key: 'obra', label: 'Obra' },
    { key: 'contrato', label: 'Contrato' },
    { key: 'contratista', label: 'Contratista', render: (row: Obra) => row.contratista || '-' },
    {
      key: 'oficioConsecutivo',
      label: 'Oficio',
      render: (row: Obra) => {
        if (row.numeroOficio) return row.numeroOficio;
        if (row.oficio && row.oficio.trim() !== '') return row.oficio;
        if (row.oficioConsecutivo) {
          const padding = String(row.oficioConsecutivo).padStart(4, '0');
          return `CONS. ZONA -${padding}/${row.anio || '2026'}`;
        }
        return '-';
      }
    },
    {
      key: 'id',
      label: 'Acciones',
      render: (row: Obra) => {
        const isAssigned = (row.estatus && row.estatus !== 'PENDIENTE') || (row.contrato && row.contrato.trim() !== '') || (row.fechaAsignacion && row.fechaAsignacion.trim() !== '');
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeTab === 'asignacion' ? (
              <Button
                variant="contained"
                size="small"
                disabled={!isAssigned}
                startIcon={<VisibilityIcon />}
                onClick={() => handleOpenPreview(row.id, 'oficio')}
                sx={{
                  backgroundColor: isAssigned ? 'var(--color-primary)' : '#94a3b8',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: isAssigned ? 'var(--color-secondary)' : '#94a3b8',
                  }
                }}
              >
                {isAssigned ? 'Oficio Asignación' : 'No Asignada'}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<VisibilityIcon />}
                onClick={() => handleOpenPreview(row.id, 'conciliacion')}
                sx={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#1b5e20',
                  }
                }}
              >
                Conciliación Obra
              </Button>
            )}
          </Box>
        );
      }
    }
  ];

  return (
    <div>
      <h1 className="page-title">Módulo de Reportes</h1>

      {/* Tabs Selector for Separation */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 3,
          borderBottom: '1px solid #e2e8f0',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
          }
        }}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Oficios de Asignación" value="asignacion" />
        <Tab label="Conciliaciones de Obra" value="conciliacion" />
        <Tab label="Aviso de Suspensión" value="suspension" />
        <Tab label="Aviso de Suspensión MT" value="suspensionMt" />
        <Tab label="Etiquetas" value="etiquetas" />
      </Tabs>

      {(activeTab === 'asignacion' || activeTab === 'conciliacion') && (
        <Card sx={{ mb: 4 }} className="card">
        <CardContent sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2, px: 1 }}>
            <Typography variant="h6" sx={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 1, m: 0 }}>
              <DescriptionIcon /> {activeTab === 'asignacion' ? 'Oficios de Asignación de Obras' : 'Conciliaciones de Obras'}
            </Typography>
            
            {activeTab === 'conciliacion' && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={mostrarAdmin}
                      onChange={(e) => setMostrarAdmin(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Firma Administrador</Typography>}
                  sx={{ m: 0 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={mostrarContratista}
                      onChange={(e) => setMostrarContratista(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>Firma Superintendente</Typography>}
                  sx={{ m: 0 }}
                />
              </Box>
            )}
          </Box>
          <Typography variant="body2" sx={{ mb: 3, color: 'var(--color-text-light)' }}>
            {activeTab === 'asignacion' 
              ? 'Listado de obras contratadas y listas para emitir su oficio de inicio y asignación correspondiente.'
              : 'Listado de obras contratadas y listas para emitir su respectiva conciliación de obra.'}
          </Typography>

          {loading ? (
            <Typography>Cargando obras asignadas...</Typography>
          ) : (
            <ReusableTable columns={tableColumns} rows={obras} searchable={true} />
          )}
        </CardContent>
      </Card>
      )}

      {/* Previsualización Modal - Replaced with Components */}
      {previewType === 'oficio' && (
        <OficioPreviewDialog
          open={previewOpen}
          onClose={handleClosePreview}
          previewData={previewData}
          handlePrintConfirm={handlePrintConfirm}
          supervisorNombre={supervisorNombre} setSupervisorNombre={setSupervisorNombre}
          supervisorRpe={supervisorRpe} setSupervisorRpe={setSupervisorRpe}
          supervisorCargo={supervisorCargo} setSupervisorCargo={setSupervisorCargo}
          supervisorZona={supervisorZona} setSupervisorZona={setSupervisorZona}
          mostrarSupervisor={mostrarSupervisor} setMostrarSupervisor={setMostrarSupervisor}
          adminNombre={adminNombre} setAdminNombre={setAdminNombre}
          adminRpe={adminRpe} setAdminRpe={setAdminRpe}
          adminCargo={adminCargo} setAdminCargo={setAdminCargo}
          adminZona={adminZona} setAdminZona={setAdminZona}
          mostrarAdmin={mostrarAdmin} setMostrarAdmin={setMostrarAdmin}
          mostrarContratista={mostrarContratista} setMostrarContratista={setMostrarContratista}
          contratistaNombre={contratistaNombre}
          contratistaDomicilio={contratistaDomicilio}
          superintendenteNombre={superintendenteNombre}
          zonaFooterStr={zonaFooterStr}
          zonaLocationStr={zonaLocationStr}
        />
      )}

      {previewType === 'conciliacion' && (
        <ConciliacionPreviewDialog
          open={previewOpen}
          onClose={handleClosePreview}
          previewData={previewData}
          handlePrintConfirm={handlePrintConfirm}
          supervisorNombre={supervisorNombre} setSupervisorNombre={setSupervisorNombre}
          supervisorRpe={supervisorRpe} setSupervisorRpe={setSupervisorRpe}
          supervisorCargo={supervisorCargo} setSupervisorCargo={setSupervisorCargo}
          supervisorZona={supervisorZona} setSupervisorZona={setSupervisorZona}
          mostrarSupervisor={mostrarSupervisor} setMostrarSupervisor={setMostrarSupervisor}
          adminNombre={adminNombre} setAdminNombre={setAdminNombre}
          adminRpe={adminRpe} setAdminRpe={setAdminRpe}
          adminCargo={adminCargo} setAdminCargo={setAdminCargo}
          adminZona={adminZona} setAdminZona={setAdminZona}
          mostrarAdmin={mostrarAdmin} setMostrarAdmin={setMostrarAdmin}
          mostrarContratista={mostrarContratista} setMostrarContratista={setMostrarContratista}
          superintendenteNombre={superintendenteNombre}
          setSuperintendenteNombre={setSuperintendenteNombre}
          zonaFooterStr={zonaFooterStr}
          zonaLocationStr={zonaLocationStr}
        />
      )}
      
      {/* End of Oficios/Conciliaciones section */}
      
      {activeTab === 'suspension' && (
        <AvisoSuspensionTab />
      )}

      {activeTab === 'suspensionMt' && (
        <AvisoSuspensionMtTab />
      )}

      {activeTab === 'etiquetas' && (
        <EtiquetasTab 
          obras={obras}
          etiquetasColumns={etiquetasColumns}
          selectedCount={selectedIds.length}
          onPrint={() => handlePrintEtiquetas(obras)}
        />
      )}
    </div>
  );
}
