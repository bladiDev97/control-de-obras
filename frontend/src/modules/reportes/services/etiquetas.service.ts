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

    let labelsHtml = obras.map(obra => `
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
            <td>${obra.at || '-'}</td>
            <td colspan="5">${obra.rd || '-'}</td>
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
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Impresión de Etiquetas</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 1cm;
              background-color: #fff;
            }
            .label-container {
              /* Tamaño estándar de una muesca de folder 1/2 corte carta */
              width: 14.5cm;
              height: 2.5cm; 
              margin-bottom: 1cm;
              page-break-inside: avoid;
            }
            .label-table {
              width: 100%;
              height: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            .label-table td {
              border: 2px solid #000;
              font-size: 11px;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: 2px 4px;
              word-wrap: break-word;
              overflow: hidden;
            }
            
            @media print {
              body { padding: 0.5cm; }
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
