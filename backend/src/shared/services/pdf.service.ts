import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class PdfService {
  private async resolveImageBuffer(imgUrlOrBase64?: string): Promise<Buffer | null> {
    if (!imgUrlOrBase64) return null;
    try {
      const s = String(imgUrlOrBase64).trim();
      if (s.startsWith('data:image/')) {
        const base64Data = s.replace(/^data:image\/\w+;base64,/, '');
        return Buffer.from(base64Data, 'base64');
      }
      if (s.startsWith('http://') || s.startsWith('https://')) {
        const res = await axios.get(s, { responseType: 'arraybuffer', timeout: 7000 });
        return Buffer.from(res.data);
      }
      if (fs.existsSync(s)) {
        return fs.readFileSync(s);
      }
    } catch {
      return null;
    }
    return null;
  }

  public async generateOficioPdf(data: {
    consecutivo: string;
    dateText: string;
    contratista: string;
    domicilio: string;
    contrato: string;
    obraDesc: string;
    rd: string;
    municipio: string;
    poblacion?: string;
    solicitante: string;
    at: string;
    siad: string;
    activo: string;
    orden: string;
    atRetiro: string;
    siadRetiro: string;
    or: string;
    limitDateText: string;
    mostrarSupervisor: boolean;
    supervisorNombre: string;
    supervisorRpe: string;
    supervisorCargo: string;
    supervisorZona: string;
    supervisorFirmaUrl?: string;
  }): Promise<Buffer> {
    const firmaBuffer = await this.resolveImageBuffer(data.supervisorFirmaUrl);
    return new Promise((resolve, reject) => {
      try {
        // Page size is letter (612 x 792 points).
        // Margins: Left: 70, Right: 70, Top: 150, Bottom: 5 (minimized to prevent page breaks for footer text).
        const doc = new PDFDocument({
          size: 'letter',
          margins: {
            top: 150,
            bottom: 5,
            left: 70,
            right: 70
          }
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // 1. Draw the CFE Membrete background image at (0, 0)
        const membreteCandidates = [
          path.join(process.cwd(), 'assets/membrete.png'),
          path.join(__dirname, '../../../assets/membrete.png'),
          path.join(process.cwd(), '../frontend/public/membrete.png'),
        ];
        const membretePath = membreteCandidates.find((p) => fs.existsSync(p));
        if (membretePath) {
          doc.image(membretePath, 0, 0, { width: 612, height: 792 });
        }

        // 2. Consecutivo & Asunto (Top Right)
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#212121');
        doc.text(data.consecutivo, { align: 'right' });
        doc.text('Asunto: Oficio de inicio de obra', { align: 'right' });
        doc.moveDown(0.8);

        // 3. Date Line (Left)
        doc.font('Helvetica').text(`Pátzcuaro, Mich., a ${data.dateText}.`);
        doc.moveDown(0.8);

        // 4. Recipient
        doc.font('Helvetica-Bold').text(data.contratista.toUpperCase());
        doc.font('Helvetica').text(data.domicilio.toUpperCase());
        doc.moveDown(0.8);

        // 5. Body Paragraph 1 (Mixed fonts with runs)
        doc.font('Helvetica').fontSize(10).text(
          'De conformidad con la Disposición 93 de las Disposiciones Generales en materia de adquisiciones, arrendamientos, contratación de servicios y ejecución de obras de la Comisión Federal de Electricidad y sus empresas productivas subsidiarias, así como a lo establecido en las especificaciones CFE DCCIAMBT para la construcción de Líneas y Redes de Distribución Áreas y Subterráneas, relacionadas con el contrato de Obra Pública No. ',
          { continued: true, align: 'justify', lineGap: 3 }
        );
        doc.font('Helvetica-Bold').text(data.contrato, { continued: true });
        doc.font('Helvetica').text(', suscrito con su empresa, en el cual se amparan los trabajos: ', { continued: true });
        doc.font('Helvetica-Bold').text(data.obraDesc, { continued: true });
        doc.font('Helvetica').text(' en Zona Pátzcuaro, solicito a usted iniciar los trabajos de construcción de la siguiente obra: ', { continued: true });
        doc.font('Helvetica-Bold').text(`R.D. ${data.rd}`, { continued: true });
        doc.font('Helvetica').text(' del municipio de ', { continued: true });
        doc.font('Helvetica-Bold').text(data.municipio, { continued: true });
        if (data.poblacion) {
          doc.font('Helvetica').text(', población de ', { continued: true });
          doc.font('Helvetica-Bold').text(data.poblacion, { continued: true });
        }
        doc.font('Helvetica').text(' a nombre del Sr. ', { continued: true });
        doc.font('Helvetica-Bold').text(data.solicitante, { continued: false });

        doc.moveDown(0.8);

        // 6. Data Table
        const tableTop = doc.y;
        const colWidths = [60, 70, 80, 80, 70, 72, 40];
        const headers = ['AT', 'SIAD', 'ACTIVO', 'ORDEN', 'AT RETIRO', 'SIAD RETIRO', 'OR'];
        const values = [data.at, data.siad, data.activo, data.orden, data.atRetiro, data.siadRetiro, data.or];

        // Header Row background
        doc.fillColor('#f5f5f5');
        doc.rect(70, tableTop, 472, 20).fill();
        doc.fillColor('#212121').font('Helvetica-Bold').fontSize(8);

        // Draw Headers text
        let currentX = 70;
        for (let i = 0; i < headers.length; i++) {
          doc.text(headers[i], currentX, tableTop + 6, { width: colWidths[i], align: 'center' });
          currentX += colWidths[i];
        }

        // Draw data row text
        doc.font('Helvetica').fontSize(8);
        currentX = 70;
        for (let i = 0; i < values.length; i++) {
          doc.text(String(values[i] || '-'), currentX, tableTop + 26, { width: colWidths[i], align: 'center' });
          currentX += colWidths[i];
        }

        // Draw lines around and inside table
        doc.strokeColor('#757575').lineWidth(0.5);
        doc.rect(70, tableTop, 472, 40).stroke(); // boundary box
        doc.moveTo(70, tableTop + 20).lineTo(542, tableTop + 20).stroke(); // horizontal line

        // Draw vertical separating lines
        let lineX = 70;
        for (let i = 0; i < colWidths.length - 1; i++) {
          lineX += colWidths[i];
          doc.moveTo(lineX, tableTop).lineTo(lineX, tableTop + 40).stroke();
        }

        const nextY = tableTop + 50;

        // 7. Body Paragraph 2 (Specify x=70 and width=472 to reset PDFKit column flow context)
        doc.font('Helvetica').fontSize(10).text(
          'La cual deberá quedar terminada a más tardar en la siguiente fecha: ',
          70,
          nextY,
          { continued: true, align: 'justify', lineGap: 3, width: 472 }
        );
        doc.font('Helvetica-Bold').text(data.limitDateText, { continued: false });
        
        doc.moveDown(0.4);
        doc.font('Helvetica').text('Se adjunta al presente, plano del proyecto.', 70, doc.y, { width: 472 });
        doc.moveDown(0.4);
        doc.font('Helvetica').text('Sin otro particular de momento, quedo de Usted.', 70, doc.y, { width: 472 });

        // 8. Signature Block
        if (data.mostrarSupervisor) {
          doc.moveDown(firmaBuffer ? 1.0 : 4.0);
          doc.font('Helvetica-Bold').fontSize(11).text('Atentamente', 70, doc.y, { align: 'center', width: 472 });

          if (firmaBuffer) {
            const imgWidth = 140;
            const imgHeight = 45;
            const imgX = 70 + (472 - imgWidth) / 2;
            const imgY = doc.y + 4;
            try {
              doc.image(firmaBuffer, imgX, imgY, { fit: [imgWidth, imgHeight], align: 'center' });
            } catch {
              // fallback if image drawing encounters an issue
            }
            doc.y = imgY + imgHeight + 4;
          } else {
            doc.moveDown(2.5);
          }

          const lineY = doc.y;
          doc.strokeColor('#212121').lineWidth(0.5);
          doc.moveTo(196, lineY).lineTo(416, lineY).stroke();
          doc.moveDown(0.5);

          doc.font('Helvetica-Bold').fontSize(10).text(data.supervisorNombre, 70, doc.y, { align: 'center', width: 472 });
          doc.font('Helvetica').fontSize(9);
          doc.text(`RPE: ${data.supervisorRpe}`, 70, doc.y, { align: 'center', width: 472 });
          doc.text(data.supervisorCargo, 70, doc.y, { align: 'center', width: 472 });
          doc.text(data.supervisorZona, 70, doc.y, { align: 'center', width: 472 });
        }

        // 9. Absolute Footer Address (Always force drawing on the first page, aligned with bottom line)
        doc.switchToPage(0);
        doc.fontSize(8).fillColor('#212121');
        doc.text(
          'Libramiento Ignacio Zaragoza no.1409, Colonia Centro, Pátzcuaro, Michoacán, México\nC.P. 61600 Tel. 434 34 2 87 59, ext. 21759',
          180,
          751,
          { width: 392, align: 'center', lineGap: 2 }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
