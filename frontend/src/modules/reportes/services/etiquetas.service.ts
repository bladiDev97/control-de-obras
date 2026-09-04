import { Obra } from '../../obras/types/obra.types';

export const etiquetasService = {
  generarYImprimirEtiquetas(obras: Obra[]) {
    if (obras.length === 0) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '1200px';
    iframe.style.height = '800px';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    let labelsHtml = obras.map(obra => {
      const cleanPoblacion = (obra.poblacion || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
      const cleanRd = (obra.rd || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
      const poblacion = cleanPoblacion || cleanRd;
      const nombre = (obra.nombreSolicitante || '').trim();

      const parts = [poblacion, nombre].filter(Boolean).join(' ');
      const rdLabel = parts ? parts : (cleanRd || obra.obra || '-');

      return `
      <div class="label-container">
        <table class="label-table">
          <colgroup>
            <col style="width: 16.66%;">
            <col style="width: 16.66%;">
            <col style="width: 16.66%;">
            <col style="width: 16.66%;">
            <col style="width: 16.66%;">
            <col style="width: 16.66%;">
          </colgroup>
          <tr>
            <td style="font-weight: bold; background-color: #f8fafc;">${obra.at || '-'}</td>
            <td colspan="5" style="text-align: left; padding-left: 6px;">R.D. ${rdLabel}</td>
          </tr>
          <tr>
            <td>${obra.obra || '-'}</td>
            <td>${obra.activo || '-'}</td>
            <td>${obra.orden || '-'}</td>
            <td>${obra.atRetiro || '-'}</td>
            <td>${obra.siadRetiro || '-'}</td>
            <td>${obra.ordenRetiro || '-'}</td>
          </tr>
        </table>
      </div>
    `;
    }).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Impresión de Etiquetas de Expediente</title>
          <style>
            @page {
              size: letter portrait;
              margin: 1cm;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fff;
            }
            .label-container {
              /* Medidas exactas de la etiqueta: Largo 14.5cm x Ancho (Alto) 1.5cm */
              width: 14.5cm;
              height: 1.5cm; 
              margin-bottom: 0.6cm;
              page-break-inside: avoid;
              border: 1.5px dashed #000000; /* Línea punteada exterior para guiar el recorte con tijera/cúter */
              box-sizing: border-box;
              padding: 1px;
              position: relative;
              background-color: #ffffff;
            }
            .label-table {
              width: 100%;
              height: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            .label-table td {
              border: 1px solid #000000;
              font-size: 8pt;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: 1px 2px;
              word-wrap: break-word;
              overflow: hidden;
              line-height: 1.1;
            }
            
            @media print {
              body { padding: 0; }
              .label-container {
                border: 1.5px dashed #000000 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${labelsHtml}
          <script>
            setTimeout(() => {
              window.focus();
              window.print();
              if (window.parent && window.parent !== window) {
                window.parent.postMessage('removeEtiquetasIframe', '*');
              }
            }, 500);
          </script>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'removeEtiquetasIframe') {
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

