import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ObraService } from '../../obras/domain/services/obra.service';
import { WhatsappService } from '../services/whatsapp.service';
import { IObra } from '../../obras/domain/ientities/i-obra.interface';

@Injectable()
export class ObrasVencidasCron {
  private readonly logger = new Logger(ObrasVencidasCron.name);

  constructor(
    private readonly obraService: ObraService,
    private readonly whatsappService: WhatsappService,
  ) {}

  // Helper to parse dates locally and avoid UTC shifting (same as frontend)
  private parseLocalDate(dateStr: string): Date {
    if (!dateStr) return new Date(NaN);
    const cleanStr = dateStr.split(' ')[0].trim();
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const yyyy = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10) - 1;
        const dd = parseInt(parts[2], 10);
        return new Date(yyyy, mm, dd);
      }
    }
    return new Date(dateStr);
  }

  private calculateDiasParaVencerse(obra: IObra): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tipo = (obra.tipoObra || '').toUpperCase();
    const isAportaciones = tipo === 'APORTACIONES';

    if (isAportaciones) {
      if (!obra.fechaPago) return 999;
      try {
        const pagoDate = this.parseLocalDate(obra.fechaPago);
        if (isNaN(pagoDate.getTime())) return 999;
        const diasSseebra = obra.diasObraAPORTACIONES || 9;
        const limitDate = new Date(pagoDate);
        limitDate.setDate(limitDate.getDate() + diasSseebra);
        limitDate.setHours(0, 0, 0, 0);
        const diffTime = limitDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return 999;
      }
    } else {
      // RPT y FSU
      const rawFechaProg = (obra as any).fechaProgramada;
      if (!rawFechaProg) return 999;
      try {
        const progDate = this.parseLocalDate(rawFechaProg);
        if (isNaN(progDate.getTime())) return 999;
        progDate.setHours(0, 0, 0, 0);
        const diffTime = progDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch {
        return 999;
      }
    }
  }

  // Se ejecuta todos los días a las 20:00 (8 PM)
  @Cron('0 20 * * *', { timeZone: 'America/Mexico_City' })
  public async handleCron() {
    this.logger.log('Running ObrasVencidasCron at 8:00 PM...');
    const pk = 'bladi.PigeonSave@gmail.com';
    
    try {
      const obras = await this.obraService.getAll(pk);
      // Solo iterar obras activas, que no estén cerradas/capitalizadas
      const activas = obras.filter(o => o.estatus !== 'CAPITALIZADA' && (o.estatus as string) !== 'CANCELADA');

      for (const obra of activas) {
        const diasParaVencerse = this.calculateDiasParaVencerse(obra);

        // Si exactamente hoy se vence o ya tiene 0 días, enviar notificación
        if (diasParaVencerse === 0) {
          this.logger.log(`Obra ${obra.obra} (AT: ${obra.at}) reached 0 days. Sending notification.`);
          await this.whatsappService.sendObraVencidaNotification(obra as any, diasParaVencerse);
        }
      }
    } catch (error: any) {
      this.logger.error(`Error in ObrasVencidasCron: ${error.message}`);
    }
  }
}
