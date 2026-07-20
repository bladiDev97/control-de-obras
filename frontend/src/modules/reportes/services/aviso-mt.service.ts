export const avisoMtService = {
  getAvisoHtml(
    fechaElaboracion: string,
    municipioEstado: string, // e.g. "Pátzcuaro, Michoacán."
    fechaSuspension: string,
    horario: string,
    ubicacion: string,
    telefono: string,
    supervisorNombre: string,
    supervisorZona: string,
    footerText: string,
    forPrint: boolean = false
  ) {
    const tableRows = Array.from({ length: 11 }, (_, i) => `
      <tr>
        <td class="col-num">${i + 1}</td>
        <td class="col-nombre"></td>
        <td class="col-direccion"></td>
        <td class="col-firma"></td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Aviso de Suspensión M.T.</title>
          <style>
            @page {
              size: letter portrait;
              margin: 0;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #000;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              background-color: ${forPrint ? 'transparent' : '#fff'};
            }
            .page-container {
              position: relative;
              width: 21.59cm;
              height: 27.94cm;
              box-sizing: border-box;
              page-break-after: always;
              overflow: hidden;
              margin: 0 auto;
              margin-bottom: ${forPrint ? '0' : '20px'};
              background-color: #fff;
              box-shadow: ${forPrint ? 'none' : '0 2px 10px rgba(0,0,0,0.1)'};
            }
            .page-container:last-child {
              page-break-after: auto;
            }
            .bg-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 0;
            }
            .bg-container img {
              width: 100%;
              height: 100%;
              object-fit: fill;
            }
            .content {
              position: relative;
              z-index: 1;
              padding-top: 150px;
              padding-left: 70px;
              padding-right: 70px;
              padding-bottom: 120px;
              display: flex;
              flex-direction: column;
              height: 100%;
              box-sizing: border-box;
            }
            .header-text {
              text-align: right;
              font-size: 13px;
              line-height: 1.2;
              margin-bottom: 15px;
            }
            .title {
              text-align: left;
              font-weight: bold;
              font-size: 15px;
              margin-bottom: 10px;
            }
            .salutation {
              margin-bottom: 15px;
            }
            .paragraph {
              text-align: justify;
              margin-bottom: 1px;
            }
            .atentamente-block {
              text-align: left;
            }
            .signature-info-block {
              text-align: left;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            .signature-info-block .name {
              font-weight: bold;
            }
            .text-red {
              color: #000;
            }
            .users-table {
              width: 80%;
              margin-left: 0;
              margin-right: auto;
              border-collapse: collapse;
              font-size: 12px;
              table-layout: fixed;
            }
            .users-table th {
              border: 1px solid #000;
              padding: 8px 5px;
              text-align: center;
              font-weight: normal;
            }
            .users-table td {
              border: 1px solid #000;
              padding: 5px 5px;
            }
            .users-table .col-num {
              text-align: center;
              width: 8%;
            }
            .users-table .col-nombre {
              width: 35%;
            }
            .users-table .col-direccion {
              width: 30%;
            }
            .users-table .col-firma {
              width: 30%;
            }
            .footer-text {
              position: absolute;
              bottom: 55px;
              left: 190px;
              right: 0;
              text-align: center;
              font-size: 8.5px;
              color: rgba(157, 36, 73, 0.7);
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1 -->
          <div class="page-container">
            <div class="bg-container">
              <img src="/membrete.png" alt="Membrete" />
            </div>
            <div class="content">
              <div class="header-text">
                División de Distribución Centro Occidente<br />
                Subgerencia de Planeación-Construcción<br />
                <span class="text-red">${supervisorZona}</span>/Departamento de Planeación<br />
                Construcción de Media y Baja Tensión<br />
                <span class="text-red">
                  ${fechaElaboracion}, ${municipioEstado}
                </span>
              </div>

              <div class="title">
                Notificación de interrupción de Suministro de Energía Eléctrica
              </div>

              <div class="salutation">
                Estimado Usuario:
              </div>

              <div class="paragraph">
                Le informamos que estaremos trabajando en el <strong>mantenimiento y mejora integral a nuestras instalaciones</strong> a fin de brindarle un mejor servicio. Por lo anterior de manera temporal el servicio de energía eléctrica tendrá una suspensión el <strong class="text-red">${fechaSuspension}</strong> en horario de <strong class="text-red">${horario}</strong> horas, sobre la <strong class="text-red">${ubicacion}</strong>, en <strong class="text-red">${municipioEstado}</strong>

              </div>

              <div class="paragraph">
                Le ofrecemos una disculpa por las molestias ocasionadas y le reiteramos que, para la Comisión Federal de Electricidad, es prioritario materializar nuestro compromiso social de llevar un servicio de calidad a la población.
              </div>

              <div class="paragraph">
                Cualquier duda y/o aclaración favor de comunicarse al número <strong class="text-red">${telefono}</strong> o llamar a 071.
              </div>

              <div class="paragraph">
                Una vez terminados los trabajos, se reanudará el servicio sin previo aviso. Lo anterior de conformidad con el artículo 66 del Reglamento de la Ley de la Industria Eléctrica.
              </div>

              <div style="margin-top: auto; margin-bottom: 40px; text-align: left;">
                <div class="atentamente-block" style="margin-bottom: 0px; font-weight: 900; letter-spacing: 2px;">
                  A T E N T A M E N T E
                </div>
                <div class="signature-info-block" style="display: inline-block; text-align: left;">
                  <div class="name text-red" style="margin-top: 5px; white-space: nowrap;">Ing. ${supervisorNombre}.</div>
                  <div class="text-red">Supervisor Zona.</div>
                  <div class="text-red">División Centro Occidente.</div>
                  <div class="text-red">${supervisorZona}.</div>
                </div>
              </div>
            </div>
            
            <div class="footer-text">
              ${footerText}
            </div>
          </div>

          <!-- PAGE 2 -->
          <div class="page-container">
            <div class="bg-container">
              <img src="/membrete.png" alt="Membrete" />
            </div>
            <div class="content">
              <div class="header-text">
                División de Distribución Centro Occidente<br />
                Subgerencia de Planeación-Construcción<br />
                <span class="text-red">${supervisorZona}</span>/Departamento de Planeación<br />
                Construcción de Media y Baja Tensión<br />
                <span class="text-red">
                  ${fechaElaboracion}, ${municipioEstado}
                </span>
              </div>

              <div class="title">
                Notificación de interrupción de Suministro de Energía Eléctrica
              </div>

              <div class="salutation">
                Estimado Usuario:
              </div>

              <div class="paragraph">
                Le informamos que estaremos trabajando en el <strong>mantenimiento y mejora integral a nuestras instalaciones</strong> a fin de brindarle un mejor servicio. Por lo anterior de manera temporal el servicio de energía eléctrica tendrá una suspensión el <strong class="text-red">${fechaSuspension}</strong> en horario de <strong class="text-red">${horario}</strong> horas, sobre la <strong class="text-red">${ubicacion}</strong>, en <span class="text-red">${municipioEstado}</span>

              </div>

              <div class="paragraph">
                Le ofrecemos una disculpa por las molestias ocasionadas y le reiteramos que, para la Comisión Federal de Electricidad, es prioritario materializar nuestro compromiso social de llevar un servicio de calidad a la población.
              </div>


              <div class="paragraph">
                Agradecemos su atención al presente y solicitamos disculpe las molestias que por estos trabajos le ocasionamos; nuestro objetivo principal es seguir conectados contigo; evitándole interrupciones del suministro y garantizando la seguridad de las instalaciones.
              </div>

              <table class="users-table" style="margin-top: 35px;">
                <thead>
                  <tr>
                    <th class="col-num">Núm.</th>
                    <th class="col-nombre">Nombre de usuario afectado</th>
                    <th class="col-direccion">Dirección</th>
                    <th class="col-firma">Firma</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>

            </div>
            
            <div class="footer-text">
              ${footerText}
            </div>
          </div>

          ${forPrint ? `
          <script>
            setTimeout(() => {
              window.focus();
              window.print();
              if (window.parent && window.parent !== window) {
                window.parent.postMessage('removePrintIframe', '*');
              } else {
                window.close();
              }
            }, 400);
          </script>
          ` : ''}
        </body>
      </html>
    `;
  },

  generarAvisoSuspensionMt(
    fechaElaboracion: string,
    municipioEstado: string,
    fechaSuspension: string,
    horario: string,
    ubicacion: string,
    telefono: string,
    supervisorNombre: string,
    supervisorZona: string,
    footerText: string
  ) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '800px';
    iframe.style.height = '1120px';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const htmlContent = this.getAvisoHtml(
      fechaElaboracion,
      municipioEstado,
      fechaSuspension,
      horario,
      ubicacion,
      telefono,
      supervisorNombre,
      supervisorZona,
      footerText,
      true
    );

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'removePrintIframe') {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
  }
};
