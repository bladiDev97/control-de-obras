import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Routes } from '../../routes/routes.constants';
import { ConfigService } from '../../domain/services/config.service';
import { JsonResponse } from '../model/json-response.class';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags(Routes.Config.ApiTags)
@Controller(Routes.Config.Controller)
export class ConfigController {
  constructor(private readonly configService: ConfigService) { }

  @Get(Routes.Config.GetSmtp)
  public async getSmtp(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.configService.getSmtp(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'SMTP settings retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Post(Routes.Config.SaveSmtp)
  public async saveSmtp(@Res() response: Response, @Body() body: any): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.configService.saveSmtp(pk, body);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'SMTP settings saved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Post(Routes.Config.TestSmtp)
  public async testSmtp(@Res() response: Response, @Body() body: any): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const { recipient, ...smtpConfig } = body;

    try {
      await this.configService.testSmtp(pk, smtpConfig, recipient);
      const jsonResponse = new JsonResponse({
        data: true,
        message: 'SMTP connection tested and email sent successfully',
      });
      response.status(HttpStatus.OK).send(jsonResponse);
      return jsonResponse;
    } catch (err: any) {
      try {
        const uploadDir = path.resolve('uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const logPath = path.join(uploadDir, 'error-smtp.log');
        const logContent = `========================================
TIMESTAMP: ${new Date().toISOString()}
SMTP HOST: ${smtpConfig.host}
SMTP PORT: ${smtpConfig.port}
SMTP USER: ${smtpConfig.user}
ERROR MESSAGE: ${err.message}
----------------------------------------
STACK TRACE:
${err.stack}
========================================
\n`;
        fs.writeFileSync(logPath, logContent, 'utf8');
      } catch (logErr) {
        console.error('Failed to write SMTP error log to file:', logErr);
      }

      response.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message: `SMTP test connection failed: ${err.message}`,
      });
      return;
    }
  }

  @Post(Routes.Config.TestWhatsapp)
  public async testWhatsapp(@Res() response: Response, @Body() body: any): Promise<any> {
    try {
      await this.configService.testWhatsapp(body);
      const jsonResponse = new JsonResponse({
        data: true,
        message: 'WhatsApp message sent successfully',
      });
      response.status(HttpStatus.OK).send(jsonResponse);
      return jsonResponse;
    } catch (err: any) {
      response.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message: `WhatsApp test connection failed: ${err.message}`,
      });
      return;
    }
  }

  @Post(Routes.Config.TestWhatsappAlert)
  public async testWhatsappAlert(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    try {
      const sentCount = await this.configService.testWhatsappAlert(pk);
      const jsonResponse = new JsonResponse({
        data: sentCount,
        message: `Prueba de alertas completada. Se envió aviso a WhatsApp.`,
      });
      response.status(HttpStatus.OK).send(jsonResponse);
      return jsonResponse;
    } catch (err: any) {
      response.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message: `Fallo al probar alertas por vencer: ${err.message}`,
      });
      return;
    }
  }
}
