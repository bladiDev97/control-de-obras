import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Routes
import { Routes } from 'src/shared/routes/routes.constants';

import { memoryStorage } from 'multer';

// Services
import { ObraService } from '../../domain/services/obra.service';
import { S3Service } from 'src/shared/services/s3.service';

// DTOs
import { ObrasCreateDto } from '../dto/obra.create.dto';
import { ObrasUpdateDto } from '../dto/obra.update.dto';
import { ObrasTerminarDto } from '../dto/obra.terminar.dto';
import { ObrasAsignarDto } from '../dto/obra.asignar.dto';
import { ObrasImportDto } from '../dto/obra.import.dto';

// Models / Utils
import { JsonResponse } from 'src/shared/application/model/json-response.class';

// Multer memory storage configuration for direct buffer upload to S3
const storage = memoryStorage();

@ApiTags(Routes.Obras.ApiTags)
@Controller(Routes.Obras.Controller)
export class ObraController {
  private readonly logger = new Logger(ObraController.name);

  constructor(
    private readonly obraService: ObraService,
    private readonly s3Service: S3Service,
  ) {}

  /** Proxy / Stream Plano PDF to view in browser */
  @Get('plano-view')
  public async viewPlano(
    @Res() response: Response,
    @Query('url') fileUrl: string,
  ): Promise<any> {
    if (!fileUrl) {
      throw new BadRequestException('URL del plano es requerida');
    }

    try {
      let key = fileUrl;
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        if (fileUrl.includes('.amazonaws.com/')) {
          key = fileUrl.split('.amazonaws.com/')[1];
        }
      }
      key = key.replace(/^\//, '');

      // 1. Verify object exists in S3 before generating presigned GET URL
      try {
        const existsInS3 = await this.s3Service.objectExists(key);
        if (existsInS3) {
          const presignedUrl = await this.s3Service.getPresignedViewUrl(key);
          return response.redirect(presignedUrl);
        } else {
          this.logger.warn(`S3 object does not exist for key: ${key}. Checking local storage...`);
        }
      } catch (s3Error: any) {
        this.logger.warn(`S3 check failed for key ${key}: ${s3Error.message}. Checking local storage...`);
      }

      // 2. Try to fetch from local disk
      const cleanFilename = path.basename(key);
      const localPaths = [
        path.resolve(key),
        path.resolve('uploads', cleanFilename),
        path.resolve('..', 'uploads', cleanFilename),
      ];

      for (const localPath of localPaths) {
        if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
          response.setHeader('Content-Type', 'application/pdf');
          response.setHeader('Content-Disposition', `inline; filename="${cleanFilename || 'plano.pdf'}"`);
          return response.sendFile(localPath);
        }
      }

      // 3. Fallback HTML if file not found in S3 or local storage
      response.status(HttpStatus.NOT_FOUND).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Plano No Encontrado</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #334155; }
            .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); text-align: center; max-width: 440px; width: 90%; }
            .icon { font-size: 3.5rem; margin-bottom: 1rem; }
            h2 { color: #dc2626; margin: 0 0 0.5rem 0; font-size: 1.5rem; }
            p { color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
            .badge { background: #f1f5f9; padding: 0.6rem 1rem; border-radius: 8px; font-family: monospace; font-size: 0.8rem; color: #475569; word-break: break-all; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">📄❌</div>
            <h2>Plano no disponible</h2>
            <p>El archivo PDF asignado a esta obra no existe o no se encuentra disponible en el almacenamiento.</p>
            <div class="badge">${key}</div>
          </div>
        </body>
        </html>
      `);
    } catch (error: any) {
      this.logger.error(`Error al procesar el plano PDF: ${error.message}`, error);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error al cargar el plano PDF');
    }
  }

  /** Get presigned upload URL for direct S3 upload */
  @Get('upload-url')
  public async getUploadUrl(
    @Res() response: Response,
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string,
  ): Promise<any> {
    const result = await this.s3Service.getPresignedUploadUrl(fileName, contentType);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Presigned upload URL generated successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Direct file upload fallback */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  public async uploadFile(
    @Res() response: Response,
    @UploadedFile() file: any,
    @Query('fileName') fileName?: string,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }
    const fileUrl = await this.s3Service.uploadFile(file, fileName);
    const jsonResponse = new JsonResponse({
      data: { fileUrl },
      message: 'File uploaded successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** List works to capitalize (Must be defined BEFORE detail :id route) */
  @Get('capitalizar')
  public async getCapitalizar(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com'; // Shared base email pk from session context placeholder
    const result = await this.obraService.getCapitalizar(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'List of capitalizable works retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** List all Obras */
  @Get(Routes.Obras.GetAll)
  public async getAll(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com'; // Shared base email pk from session context placeholder
    const result = await this.obraService.getAll(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'All works retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Create an Obra */
  @Post(Routes.Obras.Create)
  public async create(@Res() response: Response, @Body() dto: ObrasCreateDto): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.create(pk, dto);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Work registered successfully',
    });
    response.status(HttpStatus.CREATED).send(jsonResponse);
    return jsonResponse;
  }

  /** Retrieve dynamic logbooks (bitacoras) for an Obra */
  @Get(Routes.Obras.Bitacoras)
  @ApiParam({ name: 'id', required: true, description: 'ID of the Obra' })
  public async getBitacoras(@Res() response: Response, @Param('id') id: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.getBitacoras(pk, id);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Dynamic logbooks generated successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Retrieve Oficio de Asignación metadata with consecutive number generation */
  @Get(Routes.Obras.Oficio)
  @ApiParam({ name: 'id', required: true, description: 'ID of the Obra' })
  public async getOficio(@Res() response: Response, @Param('id') id: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.getOficioAsignacion(pk, id);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Oficio de Asignación metadata generated successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Detail of an Obra */
  @Get(Routes.Obras.GetOne)
  @ApiParam({ name: 'id', required: true, description: 'ID of the Obra' })
  public async getOne(@Res() response: Response, @Param('id') id: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.getOne(pk, id);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Work details retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Update an Obra */
  @Post(Routes.Obras.Update)
  @UseInterceptors(FileInterceptor('planoPdf', { storage }))
  public async update(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: ObrasUpdateDto,
    @UploadedFile() planoPdf?: any,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const id = dto.solicitudPo;
    const planoPdfPath = planoPdf ? await this.s3Service.uploadFile(planoPdf) : undefined;
    const result = await this.obraService.update(pk, id, dto, planoPdfPath);
    response.status(HttpStatus.ACCEPTED);
    return new JsonResponse({
      data: result,
      message: 'Work updated successfully',
    });
  }

  /** Terminar Obra */
  @Patch(Routes.Obras.Terminar)
  @ApiParam({ name: 'id', required: true, description: 'ID of the Obra' })
  public async terminar(
    @Res({ passthrough: true }) response: Response,
    @Param('id') id: string,
    @Body() dto: ObrasTerminarDto,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const fechaFin = dto.fechaFinConstruccion || dto.fechaTermino;
    const result = await this.obraService.terminar(pk, id, dto.fechaTerminoCampo, fechaFin);
    response.status(HttpStatus.OK);
    return new JsonResponse({
      data: result,
      message: 'Work status updated successfully',
    });
  }

  /** Asignar Obra */
  @Patch(Routes.Obras.Asignar)
  @ApiParam({ name: 'id', required: true, description: 'ID of the Obra' })
  public async asignar(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() body: ObrasAsignarDto,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.asignar(pk, id, body);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Work assigned successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Post(Routes.Obras.Importar)
  public async importar(@Res() response: Response, @Body() dto: ObrasImportDto): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.importar(pk, dto.rows, dto.type || 'siad-plus');
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Works imported successfully',
    });
    response.status(HttpStatus.CREATED).send(jsonResponse);
    return jsonResponse;
  }

  /** Audit consecutive numbers per year to detect duplicates or gaps */
  @Get(Routes.Obras.AuditConsecutivos)
  public async auditConsecutivos(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.auditConsecutivos(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Consecutivo audit completed successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Trigger full deduplication and re-sequencing of consecutives under demand */
  @Post(Routes.Obras.ResequenceConsecutivos)
  public async resequenceConsecutivos(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.resequenceAndFixConsecutivos(pk);
    const jsonResponse = new JsonResponse({
      data: { count: result.length, works: result },
      message: 'Consecutivos resequenced successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Directly update all Obra items in DynamoDB database setting rd = Poblacion + NombreSolicitante */
  @Post('fix-database-rd')
  public async fixDatabaseRd(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.fixDatabaseRd(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Database RD fields updated successfully for all records',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }
}
