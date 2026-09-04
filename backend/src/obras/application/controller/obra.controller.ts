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
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
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
  constructor(
    private readonly obraService: ObraService,
    private readonly s3Service: S3Service,
  ) {}

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
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }
    const fileUrl = await this.s3Service.uploadFile(file);
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
    const result = await this.obraService.terminar(pk, id, dto.fechaTerminoCampo);
    response.status(HttpStatus.OK);
    return new JsonResponse({
      data: result,
      message: 'Work terminated successfully',
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
