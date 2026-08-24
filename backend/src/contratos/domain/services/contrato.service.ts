import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IContrato } from '../ientities/i-contrato.interface';
import { IAsignacion } from '../ientities/i-asignacion.interface';
import { IEstimacion } from '../ientities/i-estimacion.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { ContratoRepository } from '../../infrastructure/repositories/contrato.repository';
import { ContratoCreateDto } from '../../application/dto/contrato.create.dto';
import { ContratoUpdateDto } from '../../application/dto/contrato.update.dto';

@Injectable()
export class ContratoService {
  private readonly logger = new Logger(ContratoService.name);

  constructor(private readonly contratoRepository: ContratoRepository) {}

  public async getAll(pk: string): Promise<IContrato[]> {
    const contracts = await this.contratoRepository.contratoListAll(pk);
    return contracts.map((item) => ({
      ...item,
      numeroContrato: item.sk ? item.sk.replace('contrato#', '') : item.numeroContrato,
    }));
  }

  public async getOne(pk: string, numeroContrato: string): Promise<IContrato> {
    const keys: IGeneric = { pk, sk: numeroContrato };
    try {
      const item = await this.contratoRepository.contratoDetail(keys);
      if (!item || item.isDelete) {
        throw new NotFoundException(`Contrato ${numeroContrato} no encontrado`);
      }
      return {
        ...item,
        numeroContrato: item.sk ? item.sk.replace('contrato#', '') : item.numeroContrato,
      };
    } catch (err) {
      this.logger.error(`Error al obtener contrato ${numeroContrato}:`, err);
      throw new NotFoundException(`Contrato ${numeroContrato} no encontrado`);
    }
  }

  public async create(pk: string, dto: ContratoCreateDto): Promise<IContrato> {
    const body: IContrato = {
      pk,
      numeroContrato: dto.numeroContrato,
      licitacion: dto.licitacion,
      contratista: dto.contratista,
      montoAutorizado: dto.montoAutorizado !== undefined ? dto.montoAutorizado : 0,
      porcentajeAmpliacion: dto.porcentajeAmpliacion !== undefined ? dto.porcentajeAmpliacion : 30,
      porcentajeAmpliacionTiempo: dto.porcentajeAmpliacionTiempo,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      plazoDias: dto.plazoDias,
      direccion: dto.direccion,
      correos: dto.correos,
      residenteObra: dto.residenteObra,
      conceptos: dto.conceptos || [],
    };
    // Delete existing if any before creating/overwriting to keep it clean
    try {
      const keys: IGeneric = { pk, sk: dto.numeroContrato };
      const existing = await this.contratoRepository.contratoDetail(keys);
      if (existing) {
        await this.contratoRepository.contratoDelete(keys);
      }
    } catch {
      // ignore
    }
    const created = await this.contratoRepository.contratoCreate(body);
    return {
      ...created,
      numeroContrato: created.sk ? created.sk.replace('contrato#', '') : created.numeroContrato,
    };
  }

  public async update(pk: string, numeroContrato: string, dto: ContratoUpdateDto): Promise<IContrato> {
    const keys: IGeneric = { pk, sk: numeroContrato };
    const existing = await this.contratoRepository.contratoDetail(keys);
    if (!existing || existing.isDelete) {
      throw new NotFoundException(`Contrato ${numeroContrato} no encontrado`);
    }

    const updatedBody: IContrato = {
      ...existing,
      ...dto,
      pk,
      numeroContrato,
    };

    const updated = await this.contratoRepository.contratoUpdate(updatedBody);
    return {
      ...updated,
      numeroContrato: updated.sk ? updated.sk.replace('contrato#', '') : updated.numeroContrato,
    };
  }

  public async delete(pk: string, numeroContrato: string): Promise<IContrato> {
    const keys: IGeneric = { pk, sk: numeroContrato };
    const deleted = await this.contratoRepository.contratoDelete(keys);
    return {
      ...deleted,
      numeroContrato: deleted.sk ? deleted.sk.replace('contrato#', '') : deleted.numeroContrato,
    };
  }

  // --- Assignments Logic ---
  public async getAsignaciones(pk: string, numeroContrato: string): Promise<IAsignacion[]> {
    const list = await this.contratoRepository.asignacionList(pk, numeroContrato);
    return list.map(item => ({
      ...item,
      id: item.sk ? item.sk.replace(`asignacion#${numeroContrato}#`, '') : item.at,
    }));
  }

  public async saveAsignacion(pk: string, numeroContrato: string, at: string, body: any): Promise<IAsignacion> {
    const payload: IAsignacion = {
      pk,
      numeroContrato,
      at,
      tipoObra: body.tipoObra,
      obra: body.obra,
      orden: body.orden,
      activo: body.activo,
      conceptos: body.conceptos || {},
    };
    return await this.contratoRepository.asignacionSave(payload);
  }

  // --- Estimaciones Logic ---
  public async getEstimaciones(pk: string, numeroContrato: string): Promise<IEstimacion[]> {
    const list = await this.contratoRepository.estimacionList(pk, numeroContrato);
    return list.map(item => ({
      ...item,
      id: item.sk ? item.sk.replace(`estimacion#${numeroContrato}#`, '') : `${item.at}#${item.numeroEstimacion}`,
    }));
  }

  public async saveEstimacion(
    pk: string,
    numeroContrato: string,
    at: string,
    numeroEstimacion: string,
    body: any
  ): Promise<IEstimacion> {
    const payload: IEstimacion = {
      pk,
      numeroContrato,
      at,
      obra: body.obra,
      numeroEstimacion,
      avanceMvmo: body.avanceMvmo,
      bitacoraSupervision: body.bitacoraSupervision,
      bitacoraAutorizacion: body.bitacoraAutorizacion,
      compSind: body.compSind,
      retenerIva: body.retenerIva,
      conceptos: body.conceptos || {},
    };
    return await this.contratoRepository.estimacionSave(payload);
  }

  public async deleteEstimacion(pk: string, numeroContrato: string, at: string, numeroEstimacion: string): Promise<boolean> {
    return await this.contratoRepository.estimacionDelete(pk, numeroContrato, at, numeroEstimacion);
  }

  public async deleteEstimacionBlock(pk: string, numeroContrato: string, numeroEstimacion: string): Promise<boolean> {
    return await this.contratoRepository.estimacionBlockDelete(pk, numeroContrato, numeroEstimacion);
  }

  // --- Master Import of All Sheets ---
  public async importarCompleto(pk: string, payload: any): Promise<any> {
    const contratoDto = payload.contrato;
    const asignaciones = payload.asignaciones || [];
    const estimaciones = payload.estimaciones || [];

    // 1. Create or overwrite contract
    const contrato = await this.create(pk, contratoDto);

    // 2. Clear old assignments and save new ones
    const oldAsignaciones = await this.contratoRepository.asignacionList(pk, contrato.numeroContrato);
    for (const old of oldAsignaciones) {
      await this.contratoRepository.contratoDelete({ pk, sk: old.sk });
    }

    const savedAsignaciones = [];
    for (const asign of asignaciones) {
      asign.pk = pk;
      asign.numeroContrato = contrato.numeroContrato;
      const res = await this.contratoRepository.asignacionSave(asign);
      savedAsignaciones.push(res);
    }

    // 3. Clear old estimaciones and save new ones
    const oldEstimaciones = await this.contratoRepository.estimacionList(pk, contrato.numeroContrato);
    for (const old of oldEstimaciones) {
      await this.contratoRepository.contratoDelete({ pk, sk: old.sk });
    }

    const savedEstimaciones = [];
    for (const est of estimaciones) {
      est.pk = pk;
      est.numeroContrato = contrato.numeroContrato;
      const res = await this.contratoRepository.estimacionSave(est);
      savedEstimaciones.push(res);
    }

    return {
      contrato,
      asignacionesCount: savedAsignaciones.length,
      estimacionesCount: savedEstimaciones.length,
    };
  }
}
