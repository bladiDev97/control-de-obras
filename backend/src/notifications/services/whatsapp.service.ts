import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../shared/domain/services/config.service';
import { ObraEntity } from '../../obras/infrastructure/entities/obra.entity';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly configService: ConfigService) {}

  public async sendObraVencidaNotification(obra: ObraEntity, diasParaVencerse: number): Promise<void> {
    try {
      const config = await this.configService.getRawSmtp('bladi.PigeonSave@gmail.com');
      
      if (!config || !config.whatsappPhone || !config.whatsappApiKey) {
        this.logger.warn('No WhatsApp configuration found (whatsappPhone or whatsappApiKey missing).');
        return;
      }

      const mensaje = `⚠️ *ALERTA DE OBRA POR VENCER* ⚠️\n\nLa obra con AT *${obra.at || 'N/A'}* y número de obra *${obra.obra || 'N/A'}* tiene *${diasParaVencerse}* ${diasParaVencerse === 1 ? 'día' : 'días'} para vencerse.\n\nPor favor verifica el avance de la obra y asegúrate de registrar su término en el sistema.\n\n- Sistema de Control de Obras CFE`;
      
      const cleanPhone = config.whatsappPhone.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(mensaje);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${text}&apikey=${config.whatsappApiKey}`;
      
      const response = await axios.get(url);
      
      if (response.data && String(response.data).includes('Message queued')) {
        this.logger.log(`WhatsApp notification sent for Obra ${obra.obra}`);
      } else {
        this.logger.error(`CallMeBot error for Obra ${obra.obra}: ${response.data}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send WhatsApp notification for Obra ${obra.obra}: ${err.message}`);
    }
  }
}
