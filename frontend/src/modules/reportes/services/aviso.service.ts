export const avisoService = {
  getAvisoHtml(fecha: string, ubicacion: string, horario: string, telefono: string, forPrint: boolean = false) {
    return `
      <html>
        <head>
          <title>Aviso de Suspensión CFE</title>
          <style>
            @page {
              size: letter portrait;
              margin: 0;
            }
            /* Estilos generales y fuentes */
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden; /* Evitar barras de scroll */
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: #fff;
              color: #333;
            }
            .page-wrapper {
              display: flex;
              width: 100%;
              height: 100%;
            }
            .flyer-container {
              width: 100%; 
              height: 100%;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
              background-image: url('/formato_interrupcion.png');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
            }
            .flyer-clone {
              display: none; /* Ocultamos el segundo flyer en la pantalla normal */
            }
            
            /* Cajas de texto dinámicas con medidas relativas al viewport (vw) */
            .text-box {
              position: absolute;
              font-family: Arial, Helvetica, sans-serif;
              font-weight: bold;
              padding: 0.5vw 1vw;
              --scale-factor: 1;
              font-size: calc(var(--base-vw) * var(--scale-factor) * 1vw);
            }
            
            .text-fecha {
              top: 60%;
              left: 10%;
              color: #ffffff; 
              width: 50%;
              --base-vw: 3.18; 
              z-index: 10;
              background-color: transparent;
            }
            
            .text-ubicacion {
              top: 67%;
              left: 11%;
              color: #ffffff;
              width: 18%;
              height: 7.35vw; 
              --base-vw: 2.81; 
              z-index: 100;
              background-color: transparent; 
              display: flex;
              align-items: center; 
              justify-content: center; 
              text-align: center; 
              overflow: hidden; 
              word-wrap: break-word; 
              line-height: 1.1; 
            }

            .text-horario {
              top: 76%;
              left: 12%;
              color: #ffffff;
              width: 19%;
              height: 4.9vw; 
              --base-vw: 3.18; 
              z-index: 10;
              background-color: transparent;
              display: flex;
              align-items: center; 
              justify-content: center; 
              text-align: center; 
              overflow: hidden;
            }

            .text-telefono {
              top: 83%; 
              left: 1%; 
              color:  #ffffff;
              width: 40%; 
              height: 8.57vw; 
              --base-vw: 3.18; 
              z-index: 10;
              background-color: transparent;
              display: flex;
              align-items: center; 
              justify-content: center; 
              text-align: center; 
              overflow: hidden;
              word-wrap: break-word; 
            }
            
            /* Configuración para imprimir 2 en 1 hoja horizontal */
            @media print {
              @page { 
                size: letter landscape; 
                margin: 0; 
              }
              html, body {
                width: 100vw;
                height: 100vh;
                margin: 0;
              }
              .page-wrapper {
                display: flex;
                flex-direction: row;
                align-items: center; /* Centrar verticalmente en la hoja */
                justify-content: center;
                width: 100vw;
                height: 100vh;
              }
              .flyer-container {
                flex: 0 0 50vw;
                width: 50vw; 
                height: auto;
                aspect-ratio: 21.59 / 27.94; /* Mantiene la proporción para que no se recorte la imagen */
                border-right: 1px dashed #ccc; /* Línea de recorte */
              }
              .flyer-clone {
                display: block; /* Revelamos el segundo flyer al imprimir */
              }
              
              /* Dividir todos los vw a la mitad para impresión horizontal */
              .text-box { padding: 0.25vw 0.5vw; }
              .text-fecha { --base-vw: 1.59; }
              .text-ubicacion { height: 3.67vw; --base-vw: 1.4; }
              .text-horario { height: 2.45vw; --base-vw: 1.59; }
              .text-telefono { height: 4.28vw; --base-vw: 1.59; }
            }
          </style>
        </head>
        <body>
          <div class="page-wrapper">
            <div class="flyer-container">
              <div class="text-box text-fecha">${fecha}</div>
              <div class="text-box text-ubicacion">${ubicacion}</div>
              <div class="text-box text-horario">${horario}</div>
              <div class="text-box text-telefono">Cualquier duda y/o aclaración favor de comunicarse al número ${telefono && telefono.trim() !== '' ? telefono + ' o llamar al 071' : '071'}</div>
            </div>
            
            <div class="flyer-container flyer-clone">
              <div class="text-box text-fecha">${fecha}</div>
              <div class="text-box text-ubicacion">${ubicacion}</div>
              <div class="text-box text-horario">${horario}</div>
              <div class="text-box text-telefono">Cualquier duda y/o aclaración favor de comunicarse al número ${telefono && telefono.trim() !== '' ? telefono + ' o llamar al 071' : '071'}</div>
            </div>
          </div>
          <script>
            // Función mágica para hacer que el texto se encoja proporcionalmente y sincronice con el clon
            function autoScaleText() {
              // Solo analizamos las cajas originales (no los clones)
              const originalBoxes = document.querySelectorAll('.flyer-container:not(.flyer-clone) .text-box');
              originalBoxes.forEach(box => {
                if (window.getComputedStyle(box).height !== 'auto' && window.getComputedStyle(box).height !== '0px') {
                  let currentScale = 1.0;
                  while ((box.scrollHeight > box.clientHeight || box.scrollWidth > box.clientWidth) && currentScale > 0.3) {
                    currentScale -= 0.05;
                    box.style.setProperty('--scale-factor', currentScale);
                  }
                  // Copiamos el mismo factor de escala a los elementos clonados
                  const classList = Array.from(box.classList).filter(c => c !== 'text-box').join('.');
                  if (classList) {
                    const clones = document.querySelectorAll('.flyer-clone .' + classList);
                    clones.forEach(clone => clone.style.setProperty('--scale-factor', currentScale));
                  }
                }
              });
            }
            // Ejecutar al cargar la vista
            autoScaleText();
          </script>
          ${forPrint ? `
          <script>
            setTimeout(() => {
              window.focus();
              window.print();
              // Avisamos a la ventana principal que ya se abrió el diálogo para que elimine el iframe
              if (window.parent && window.parent !== window) {
                window.parent.postMessage('removePrintIframe', '*');
              } else {
                window.close(); // Fallback por si acaso
              }
            }, 400);
          </script>
          ` : ''}
        </body>
      </html>
    `;
  },

  generarAvisoSuspension(fecha: string, ubicacion: string, horario: string, telefono: string) {
    // Creamos un iframe invisible en lugar de abrir una pestaña nueva
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '1200px';
    iframe.style.height = '800px';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const htmlContent = this.getAvisoHtml(fecha, ubicacion, horario, telefono, true);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }

    // Escuchamos cuando el iframe termine para eliminarlo y no dejar basura en la memoria
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'removePrintIframe') {
        // Damos un pequeño respiro antes de quitarlo del DOM
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
