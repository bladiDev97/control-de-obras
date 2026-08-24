import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ObraService } from '../../obras/domain/services/obra.service';
import { WhatsappService } from '../services/whatsapp.service';
import { ConfigService } from '../../shared/domain/services/config.service';
import { IObra } from '../../obras/domain/ientities/i-obra.interface';

@Injectable()
export class ObrasVencidasCron {
  private readonly logger = new Logger(ObrasVencidasCron.name);

  constructor(
    private readonly obraService: ObraService,
    private readonly whatsappService: WhatsappService,
    private readonly configService: ConfigService,
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
    const isSseebra = tipo === 'SSEEBRA' || tipo === 'APORTACIONES';

    if (isSseebra) {
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
      // RPT y FSUE: basarse en fechaProgramada (o fechaAsignacion)
      const rawFechaProg = (obra as any).fechaProgramada || (obra as any).fechaAsignacion;
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

  // Se ejecuta dinámicamente según la hora/minuto guardada desde la interfaz (revisa cada 15 min)
  @Cron('*/15 * * * *', { timeZone: 'America/Mexico_City' })
  public async handleCron() {
    const pk = 'bladi.PigeonSave@gmail.com';
    
    try {
      const config = await this.configService.getRawSmtp(pk);
      if (!config) return;

      const nowMX = new Date();
      const currentHourNum = nowMX.getHours();
      const currentMinNum = nowMX.getMinutes();
      const currentTotalMin = currentHourNum * 60 + currentMinNum;
      const todayStr = `${nowMX.getFullYear()}-${String(nowMX.getMonth() + 1).padStart(2, '0')}-${String(nowMX.getDate()).padStart(2, '0')}`;

      const [mHourStr, mMinStr] = (config.whatsappHourMorning || '09:00').split(':');
      const morningTotalMin = parseInt(mHourStr, 10) * 60 + parseInt(mMinStr || '0', 10);

      const [aHourStr, aMinStr] = (config.whatsappHourAfternoon || '18:00').split(':');
      const afternoonTotalMin = parseInt(aHourStr, 10) * 60 + parseInt(aMinStr || '0', 10);

      const mDiff = currentTotalMin - morningTotalMin;
      const aDiff = currentTotalMin - afternoonTotalMin;

      // Only trigger ON or AFTER the target time, never before!
      const isMorningSlot = mDiff >= 0 && mDiff < 15;
      const isAfternoonSlot = aDiff >= 0 && aDiff < 15;

      let shouldSend = false;
      let updateData: any = {};

      if (isMorningSlot && config.lastAlertMorningSentDate !== todayStr) {
        shouldSend = true;
        updateData.lastAlertMorningSentDate = todayStr;
      } else if (isAfternoonSlot && config.lastAlertAfternoonSentDate !== todayStr) {
        shouldSend = true;
        updateData.lastAlertAfternoonSentDate = todayStr;
      }

      if (shouldSend) {
        this.logger.log(`[Dynamic Cron] Executing alert check at ${currentHourNum}:${currentMinNum} for date ${todayStr}...`);
        await this.runAlertCheckManual(pk);
        await this.configService.saveSmtp(pk, updateData);
      }
    } catch (error: any) {
      this.logger.error(`Error in ObrasVencidasCron: ${error.message}`);
    }
  }

  // Método público ejecutable tanto por Cron como de forma manual desde el panel
  public async runAlertCheckManual(pk: string): Promise<number> {
    let sentCount = 0;
    const obras = await this.obraService.getAll(pk);
    const activas = obras.filter(o => 
      o.estatus !== 'CAPITALIZADA' && 
      o.estatus !== 'TERMINADA' && 
      (o.estatus as string) !== 'CANCELADA' &&
      !o.fechaTerminoCampo &&
      !o.fechaFinConstruccion
    );

    for (const obra of activas) {
      const diasParaVencerse = this.calculateDiasParaVencerse(obra);

      if (diasParaVencerse >= 0 && diasParaVencerse <= 2) {
        this.logger.log(`Obra ${obra.obra} (AT: ${obra.at}) has ${diasParaVencerse} days remaining. Sending notification.`);
        await this.whatsappService.sendObraVencidaNotification(obra as any, diasParaVencerse);
        sentCount++;
      }
    }
    return sentCount;
  }
}
