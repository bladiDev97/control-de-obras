import { Injectable, Logger } from '@nestjs/common';
import { ConfigRepository } from '../../infrastructure/repositories/config.repository';
import { ISmtpConfig } from '../../domain/ientities/i-config.interface';
import { MailService } from '../../services/mail.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly mailService: MailService,
  ) {}

  public async getSmtp(pk: string): Promise<any> {
    const config = await this.configRepository.getSmtpConfig(pk);
    if (!config) return null;

    // Mask password and API Key for client security
    const result = { ...config };
    if (result.pass) {
      result.pass = '********';
    }
    if (result.whatsappApiKey) {
      result.whatsappApiKey = '********';
    }
    if (result.whatsappPhone) {
      result.whatsappPhone = '********';
    }
    return result;
  }

  public async saveSmtp(pk: string, data: ISmtpConfig): Promise<any> {
    // If password, API key, or Phone is masked, keep the existing database values!
    if (data.pass === '********' || data.whatsappApiKey === '********' || data.whatsappPhone === '********') {
      const existing = await this.configRepository.getSmtpConfig(pk);
      if (existing) {
        if (data.pass === '********') data.pass = existing.pass;
        if (data.whatsappApiKey === '********') data.whatsappApiKey = existing.whatsappApiKey;
        if (data.whatsappPhone === '********') data.whatsappPhone = existing.whatsappPhone;
      }
    }

    const saved = await this.configRepository.saveSmtpConfig(pk, data);

    // Apply configuration immediately at runtime
    if (saved.host && saved.port && saved.user && saved.pass) {
      this.mailService.setCustomTransporter({
        host: saved.host,
        port: Number(saved.port),
        user: saved.user,
        pass: saved.pass,
        from: saved.from,
      });
    }

    return this.getSmtp(pk);
  }

  public async testSmtp(pk: string, data: ISmtpConfig, recipient: string): Promise<boolean> {
    this.logger.log(`Testing SMTP connection to ${data.host}:${data.port} by sending email to ${recipient}`);

    // If password is masked, load the actual password from DB
    if (data.pass === '********') {
      const existing = await this.configRepository.getSmtpConfig(pk);
      if (existing) {
        data.pass = existing.pass;
      }
    }

    if (!data.host || !data.port || !data.user || !data.pass) {
      throw new Error('Incomplete SMTP configuration details provided.');
    }

    const testTransporter = nodemailer.createTransport({
      host: data.host,
      port: Number(data.port),
      secure: Number(data.port) === 465,
      auth: {
        user: data.user,
        pass: data.pass,
      },
    });

    // Verify connection
    await testTransporter.verify();

    // Send actual test email
    const fromAddress = data.from || data.user;
    await testTransporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject: 'Prueba de Conexión - Sistema de Control de Obras CFE',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: auto;">
          <h2 style="color: #00825a; border-bottom: 2px solid #00825a; padding-bottom: 8px;">Conexión Exitosa</h2>
          <p>Este es un correo de prueba automático enviado para verificar que la configuración de tu servidor SMTP en el <strong>Sistema de Control de Obras</strong> funciona perfectamente.</p>
          <p><strong>Servidor SMTP:</strong> <code>${data.host}:${data.port}</code></p>
          <p><strong>Remitente:</strong> <code>${fromAddress}</code></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 0.8rem; color: #64748b; text-align: center;">Enviado desde el panel de administración de Control de Obras.</p>
        </div>
      `,
    });

    return true;
  }

  public async testWhatsapp(data: { whatsappPhone: string; whatsappApiKey: string }): Promise<boolean> {
    this.logger.log(`Testing WhatsApp connection to phone ${data.whatsappPhone}`);

    // If API key or Phone is masked, load the actual value from DB
    if (data.whatsappApiKey === '********' || data.whatsappPhone === '********') {
      const existing = await this.configRepository.getSmtpConfig('bladi.PigeonSave@gmail.com');
      if (existing) {
        if (data.whatsappApiKey === '********') data.whatsappApiKey = existing.whatsappApiKey || '';
        if (data.whatsappPhone === '********') data.whatsappPhone = existing.whatsappPhone || '';
      }
    }

    if (!data.whatsappPhone || !data.whatsappApiKey) {
      throw new Error('Incomplete WhatsApp configuration details provided.');
    }
    const axios = require('axios');
    const text = encodeURIComponent('Este es un mensaje de prueba desde el Sistema de Control de Obras CFE.');
    const url = `https://api.callmebot.com/whatsapp.php?phone=${data.whatsappPhone}&text=${text}&apikey=${data.whatsappApiKey}`;
    
    try {
      const response = await axios.get(url);
      if (response.data && String(response.data).includes('Message queued')) {
        return true;
      }
      throw new Error(response.data || 'Unknown error from CallMeBot');
    } catch (err: any) {
      this.logger.error('Error sending WhatsApp test:', err.message);
      throw new Error(`WhatsApp API Error: ${err.message}`);
    }
  }
}
