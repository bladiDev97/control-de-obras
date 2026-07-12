import { Injectable, Inject, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EntityManager } from '@typedorm/core';
import { ConfigEntity } from '../infrastructure/entities/config.entity';
import { CryptoService } from '../utils/crypto';
import * as path from 'path';
import * as fs from 'fs';

function isEncrypted(val?: string): boolean {
  if (!val) return false;
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(val)) return false;
  try {
    const decrypted = CryptoService.decrypt(val);
    return /^[\x20-\x7E\s]*$/.test(decrypted);
  } catch {
    return false;
  }
}

function decryptField(val?: string): string | undefined {
  if (!val) return val;
  if (isEncrypted(val)) {
    return CryptoService.decrypt(val);
  }
  return val;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private hasLoadedCustom = false;
  private customFromAddress: string | null = null;

  constructor(
    @Inject('ENTITY_MANAGER')
    private readonly entityManager: EntityManager,
  ) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.logger.log(`Initializing SMTP transporter from .env config: ${host}:${port}`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        pool: true,
        maxConnections: 3,
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.logger.warn('SMTP credentials not configured in environment. Creating Ethereal test account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.logger.log(`Created Ethereal test account: ${testAccount.user}`);
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        this.logger.error('Failed to create Ethereal test account. Mail service will print to console logs only.', err);
      }
    }
  }

  public setCustomTransporter(config: { host: string; port: number; user: string; pass: string; from?: string }) {
    this.logger.log(`Configuring custom database SMTP transporter for: ${config.host}:${config.port}`);
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      pool: true,
      maxConnections: 3,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    this.customFromAddress = config.from || config.user;
  }

  private async loadFromDbIfFirstTime(pk: string) {
    if (this.hasLoadedCustom) return;
    try {
      const encryptedPk = CryptoService.encryptEmail(pk);
      const keys = { pk: encryptedPk, sk: 'config#smtp' };
      const config = await this.entityManager.findOne(ConfigEntity, keys);
      if (config && config.host && config.port && config.user && config.pass) {
        const decryptedUser = decryptField(config.user);
        const decryptedPass = decryptField(config.pass);
        const decryptedFrom = decryptField(config.from);
        this.setCustomTransporter({
          host: config.host,
          port: Number(config.port),
          user: decryptedUser,
          pass: decryptedPass,
          from: decryptedFrom,
        });
      }
    } catch (err) {
      this.logger.error('Failed to load database SMTP config on startup check', err);
    }
    this.hasLoadedCustom = true;
  }

  public async sendMail(options: {
    to: string | string[];
    cc?: string | string[];
    subject: string;
    text?: string;
    html: string;
    attachments?: Array<{
      filename: string;
      content?: any;
      path?: string;
    }>;
  }): Promise<boolean> {
    // Attempt database config loading
    const pk = 'bladi.PigeonSave@gmail.com';
    await this.loadFromDbIfFirstTime(pk);

    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const cc = options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined;
    const from = this.customFromAddress || process.env.SMTP_FROM || 'no-reply@control-de-obras.com';

    this.logger.log(`Sending email: "${options.subject}" to: [${to}] cc: [${cc || 'none'}]`);

    // Backup locally for easy inspection
    try {
      const uploadDir = path.resolve('uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const lastMailPath = path.join(uploadDir, 'ultimo-correo.html');
      fs.writeFileSync(lastMailPath, options.html, 'utf8');
      this.logger.log(`Saved a copy of the outgoing email locally to: ${lastMailPath}`);
    } catch (err) {
      this.logger.error('Error saving a copy of the email locally:', err);
    }

    if (!this.transporter) {
      this.logger.error('No mail transporter available. Logging mail output to console:');
      this.logger.log(`--- EMAIL BACKUP ---`);
      this.logger.log(`FROM: ${from}`);
      this.logger.log(`TO: ${to}`);
      this.logger.log(`CC: ${cc}`);
      this.logger.log(`SUBJECT: ${options.subject}`);
      this.logger.log(`--------------------`);
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        cc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email dispatched successfully: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`Ethereal email preview URL: ${previewUrl}`);
      }
      return true;
    } catch (err) {
      this.logger.error('Error sending email:', err);
      return false;
    }
  }
}
