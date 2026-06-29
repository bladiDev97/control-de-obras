import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JsonResponse } from 'src/shared/application/model/json-response.class';
import { ContratoService } from '../../domain/services/contrato.service';
import { ContratoCreateDto } from '../dto/contrato.create.dto';
import { ContratoUpdateDto } from '../dto/contrato.update.dto';
import { AsignacionSaveDto } from '../dto/asignacion.save.dto';
import { EstimacionSaveDto } from '../dto/estimacion.save.dto';

@ApiTags('Contratos')
@Controller('contratos')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) {}

  @Get()
  public async getAll(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.getAll(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'List of contracts retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Get(':numeroContrato')
  @ApiParam({ name: 'numeroContrato', required: true, description: 'Número del contrato' })
  public async getOne(@Res() response: Response, @Param('numeroContrato') numeroContrato: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.getOne(pk, numeroContrato);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Contract detail retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Post()
  public async create(@Res() response: Response, @Body() dto: ContratoCreateDto): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.create(pk, dto);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Contract registered successfully',
    });
    response.status(HttpStatus.CREATED).send(jsonResponse);
    return jsonResponse;
  }

  @Put(':numeroContrato')
  @ApiParam({ name: 'numeroContrato', required: true, description: 'Número del contrato' })
  public async update(
    @Res() response: Response,
    @Param('numeroContrato') numeroContrato: string,
    @Body() dto: ContratoUpdateDto,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.update(pk, numeroContrato, dto);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Contract updated successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Delete(':numeroContrato')
  @ApiParam({ name: 'numeroContrato', required: true, description: 'Número del contrato' })
  public async delete(@Res() response: Response, @Param('numeroContrato') numeroContrato: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.delete(pk, numeroContrato);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Contract deleted successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  // --- Assignments Endpoints ---
  @Get(':numeroContrato/asignaciones')
  @ApiParam({ name: 'numeroContrato', required: true, description: 'Número del contrato' })
  public async getAsignaciones(@Res() response: Response, @Param('numeroContrato') numeroContrato: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.getAsignaciones(pk, numeroContrato);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Assignments retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Post(':numeroContrato/asignaciones/:at')
  @ApiParam({ name: 'numeroContrato', required: true })
  @ApiParam({ name: 'at', required: true })
  public async saveAsignacion(
    @Res() response: Response,
    @Param('numeroContrato') numeroContrato: string,
    @Param('at') at: string,
    @Body() body: AsignacionSaveDto,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.saveAsignacion(pk, numeroContrato, at, body);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Assignment saved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  // --- Estimaciones Endpoints ---
  @Get(':numeroContrato/estimaciones')
  @ApiParam({ name: 'numeroContrato', required: true })
  public async getEstimaciones(@Res() response: Response, @Param('numeroContrato') numeroContrato: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.getEstimaciones(pk, numeroContrato);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Estimations retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Post(':numeroContrato/estimaciones/:at/:numeroEstimacion')
  @ApiParam({ name: 'numeroContrato', required: true })
  @ApiParam({ name: 'at', required: true })
  @ApiParam({ name: 'numeroEstimacion', required: true })
  public async saveEstimacion(
    @Res() response: Response,
    @Param('numeroContrato') numeroContrato: string,
    @Param('at') at: string,
    @Param('numeroEstimacion') numeroEstimacion: string,
    @Body() body: EstimacionSaveDto,
  ): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.saveEstimacion(pk, numeroContrato, at, numeroEstimacion, body);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Estimation saved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  // --- Master Import ---
  @Post('importar-completo')
  public async importarCompleto(@Res() response: Response, @Body() payload: any): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.contratoService.importarCompleto(pk, payload);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Full contract, assignments and estimations imported successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }
}
