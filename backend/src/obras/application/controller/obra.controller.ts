import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

// Routes
import { Routes } from 'src/shared/routes/routes.constants';

// Services
import { ObraService } from '../../domain/services/obra.service';

// DTOs
import { ObrasCreateDto } from '../dto/obra.create.dto';
import { ObrasUpdateDto } from '../dto/obra.update.dto';
import { ObrasTerminarDto } from '../dto/obra.terminar.dto';
import { ObrasAsignarDto } from '../dto/obra.asignar.dto';
import { ObrasImportDto } from '../dto/obra.import.dto';

// Models / Utils
import { JsonResponse } from 'src/shared/application/model/json-response.class';

// Multer storage configuration for saving PDF plans locally
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `plano-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags(Routes.Obras.ApiTags)
@Controller(Routes.Obras.Controller)
export class ObraController {
  constructor(private readonly obraService: ObraService) {}

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
  public async update(@Res() response: Response, @Body() dto: ObrasUpdateDto): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    // When updating, we expect the unique key (sk) to be provided as id/solicitudPo
    const id = dto.solicitudPo;
    const result = await this.obraService.update(pk, id, dto);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Work updated successfully',
    });
    response.status(HttpStatus.ACCEPTED).send(jsonResponse);
    return jsonResponse;
  }

  /** Terminar Obra */
  @Patch(Routes.Obras.Terminar)
  @ApiParam({ name: 'id', required: true, description: 'ID of the Obra' })
  public async terminar(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() dto: ObrasTerminarDto,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.obraService.terminar(pk, id, dto.fechaTerminoCampo);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Work terminated successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Asignar Obra */
  @Patch(Routes.Obras.Asignar)
  @UseInterceptors(FileInterceptor('planoPdf', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', required: true, description: 'ID of the Obra' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        at: { type: 'string' },
        tipoObra: { type: 'string' },
        rd: { type: 'string' },
        nombreSolicitante: { type: 'string' },
        ordenRetiro: { type: 'string' },
        orden: { type: 'string' },
        activo: { type: 'string' },
        fechaAsignacion: { type: 'string' },
        fechaTerminoCampo: { type: 'string' },
        contrato: { type: 'string' },
        planoPdf: { type: 'string', format: 'binary' },
        obra: { type: 'string' },
        poblacion: { type: 'string' },
        municipio: { type: 'string' },
        fechaProgramada: { type: 'string' },
        fechaPago: { type: 'string' },
        fechaAut: { type: 'string' },
        fechaSupervision: { type: 'string' },
      },
    },
  })
  public async asignar(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() body: ObrasAsignarDto,
    @UploadedFile() file?: any,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const planoPdfPath = file ? file.path : undefined;
    const result = await this.obraService.asignar(pk, id, body, planoPdfPath);
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
}
