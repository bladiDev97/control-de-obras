import { EntityManager } from '@typedorm/core';
import { Inject, Injectable } from '@nestjs/common';
import { DocumentClientTypes } from '@typedorm/document-client';
import { ContratoEntity } from '../entities/contrato.entity';
import { AsignacionEntity } from '../entities/asignacion.entity';
import { EstimacionEntity } from '../entities/estimacion.entity';
import { ObraEntity } from 'src/obras/infrastructure/entities/obra.entity';
import { TypeDORMRepository } from 'src/shared/infrastructure/repository/generic.repository';
import { Filters, Operator, SearchDTO } from 'src/shared/application/dto/search.dto';
import { IQuery } from 'src/shared/domain/ientities/i-query';
import { IContrato } from '../../domain/ientities/i-contrato.interface';
import { IAsignacion } from '../../domain/ientities/i-asignacion.interface';
import { IEstimacion } from '../../domain/ientities/i-estimacion.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { IContratoRepository } from '../../domain/irepositories/i-contrato.repository.interface';
import { CryptoService } from 'src/shared/utils/crypto';
import { globalCache } from 'src/shared/utils/cache.util';

@Injectable()
export class ContratoRepository
  extends TypeDORMRepository<ContratoEntity>
  implements IContratoRepository {
  constructor(
    @Inject('ENTITY_MANAGER')
    protected readonly entityManager: EntityManager,
  ) {
    super(ContratoEntity, entityManager);
  }

  public async contratoCreate(body: IContrato): Promise<ContratoEntity> {
    globalCache.clear(`contrato_all_${body.pk}`);
    body.sk = `contrato#${body.numeroContrato}`;
    body.isDelete = false;
    return await super.createItem(body as ContratoEntity);
  }

  public async contratoUpdate(dto: IContrato): Promise<ContratoEntity> {
    globalCache.clear(`contrato_all_${dto.pk}`);
    dto.sk = `contrato#${dto.numeroContrato}`;
    return await super.updateItem(dto as ContratoEntity);
  }

  public async contratoSearch(pk: string, dto: SearchDTO): Promise<[ContratoEntity[], DocumentClientTypes.Key]> {
    const sk = `contrato#`;
    const keys: IGeneric = { pk, sk };
    const deleteFilter: Filters = { key: 'isDelete', operator: Operator.EQUAL, value: false };
    dto.filters.push(deleteFilter);

    const query: IQuery<ContratoEntity> = {
      orderBy: dto.orderBy,
      limit: dto.limit,
      where: super.getFilters(dto),
      cursor: dto.cursor
    };

    return await super.itemsBySearchDTO<ContratoEntity>(keys, query);
  }

  public async contratoDetail(keys: IGeneric): Promise<ContratoEntity> {
    const sk = keys.sk && keys.sk.startsWith('contrato#') ? keys.sk : `contrato#${keys.sk}`;
    const detailKeys = { pk: keys.pk, sk };
    return await super.getItem(detailKeys);
  }

  public async contratoDelete(keys: IGeneric): Promise<ContratoEntity> {
    const sk = keys.sk && keys.sk.startsWith('contrato#') ? keys.sk : `contrato#${keys.sk}`;
    const deleteKeys = { pk: keys.pk, sk };
    return await super.delateItem(deleteKeys);
  }

  public async contratoListAll(pk: string): Promise<ContratoEntity[]> {
    const cacheKey = `contrato_all_${pk}`;
    const cached = globalCache.get<ContratoEntity[]>(cacheKey);
    if (cached) return cached;

    const sk = `contrato#`;
    const keys: IGeneric = { pk, sk };
    const query: IQuery<ContratoEntity> = {
      limit: 1000,
    };
    const [items] = await super.itemsBySearchDTO<ContratoEntity>(keys, query);
    const result = (items || []).filter(item => item && !item.isDelete);
    globalCache.set(cacheKey, result, 30000);
    return result;
  }

  // --- Assignments ---
  public async asignacionSave(body: IAsignacion): Promise<any> {
    const rawPk = body.pk;
    const encryptedPk = CryptoService.encryptEmail(rawPk);

    const result = await this.entityManager.find<ObraEntity>(
      ObraEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `obra#`,
        },
      },
    );

    const targetAt = (body.at || '').trim().toUpperCase();
    const obra = result.items.find(
      (o) =>
        !o.isDelete &&
        (((o.at || '').trim().toUpperCase() === targetAt) ||
          ((o.solicitudPo || '').trim().toUpperCase() === targetAt) ||
          ((o.obra || '').trim().toUpperCase() === (body.obra || '').trim().toUpperCase())),
    );

    if (obra) {
      const conceptos = body.conceptos || {};
      const contrato = body.numeroContrato || obra.contrato || '';
      await this.entityManager.update<ObraEntity>(
        ObraEntity,
        { pk: encryptedPk, sk: obra.sk },
        { conceptos, contrato } as Partial<ObraEntity>,
      );
      return {
        ...body,
        pk: CryptoService.decryptEmail(obra.pk),
        sk: `asignacion#${body.numeroContrato}#${body.at}`,
      };
    }

    return body;
  }

  public async asignacionList(pk: string, numeroContrato: string): Promise<any[]> {
    const encryptedPk = CryptoService.encryptEmail(pk);
    const result = await this.entityManager.find<ObraEntity>(
      ObraEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `obra#`,
        },
      },
    );

    const matched = result.items.filter(
      (item) => !item.isDelete && item.contrato && item.contrato.trim() === numeroContrato.trim(),
    );

    return matched.map((item) => {
      const decPk = CryptoService.decryptEmail(item.pk);
      return {
        pk: decPk,
        sk: `asignacion#${numeroContrato}#${item.at || item.solicitudPo}`,
        numeroContrato,
        at: item.at || item.solicitudPo,
        tipoObra: item.tipoObra,
        obra: item.obra,
        orden: item.orden,
        activo: item.activo,
        conceptos: item.conceptos || {},
      };
    });
  }

  // --- Estimaciones ---
  public async estimacionSave(body: IEstimacion): Promise<any> {
    const rawPk = body.pk;
    const encryptedPk = CryptoService.encryptEmail(rawPk);

    const result = await this.entityManager.find<ObraEntity>(
      ObraEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `obra#`,
        },
      },
    );

    const targetAt = (body.at || '').trim().toUpperCase();
    const obra = result.items.find(
      (o) =>
        !o.isDelete &&
        (((o.at || '').trim().toUpperCase() === targetAt) ||
          ((o.solicitudPo || '').trim().toUpperCase() === targetAt) ||
          ((o.obra || '').trim().toUpperCase() === (body.obra || '').trim().toUpperCase())),
    );

    if (obra) {
      let currentEstimaciones: any[] = Array.isArray(obra.estimaciones) ? [...obra.estimaciones] : [];
      const numEstStr = String(body.numeroEstimacion || '').trim();
      const existingIdx = currentEstimaciones.findIndex(
        (e) => String(e.numeroEstimacion || '').trim() === numEstStr,
      );

      const estItem = {
        id: `${body.at}#${body.numeroEstimacion}`,
        numeroEstimacion: body.numeroEstimacion,
        numeroContrato: body.numeroContrato,
        at: body.at,
        obra: body.obra || obra.obra,
        conceptos: body.conceptos || {},
        compSind: typeof body.compSind === 'number' ? body.compSind : 0,
        retenerIva: Boolean(body.retenerIva),
        avanceMvmo: body.avanceMvmo || '',
        bitacoraSupervision: body.bitacoraSupervision || '',
        bitacoraAutorizacion: body.bitacoraAutorizacion || '',
      };

      if (existingIdx > -1) {
        currentEstimaciones[existingIdx] = estItem;
      } else {
        currentEstimaciones.push(estItem);
      }

      currentEstimaciones.sort((a, b) => {
        const numA = parseInt(a.numeroEstimacion, 10) || 0;
        const numB = parseInt(b.numeroEstimacion, 10) || 0;
        return numA - numB;
      });

      obra.estimaciones = currentEstimaciones;
      await this.entityManager.update<ObraEntity>(
        ObraEntity,
        { pk: encryptedPk, sk: obra.sk },
        { estimaciones: obra.estimaciones } as Partial<ObraEntity>,
      );

      return {
        ...estItem,
        pk: CryptoService.decryptEmail(obra.pk),
        sk: `estimacion#${body.numeroContrato}#${body.at}#${body.numeroEstimacion}`,
      };
    }

    return body;
  }

  public async estimacionList(pk: string, numeroContrato: string): Promise<any[]> {
    const encryptedPk = CryptoService.encryptEmail(pk);
    const result = await this.entityManager.find<ObraEntity>(
      ObraEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `obra#`,
        },
      },
    );

    const matched = result.items.filter(
      (item) => !item.isDelete && item.contrato && item.contrato.trim() === numeroContrato.trim(),
    );

    const allEstimaciones: any[] = [];
    for (const item of matched) {
      if (Array.isArray(item.estimaciones)) {
        for (const est of item.estimaciones) {
          allEstimaciones.push({
            ...est,
            pk: CryptoService.decryptEmail(item.pk),
            sk: `estimacion#${numeroContrato}#${est.at || item.at}#${est.numeroEstimacion}`,
          });
        }
      }
    }

    return allEstimaciones;
  }

  public async estimacionDelete(pk: string, numeroContrato: string, at: string, numeroEstimacion: string): Promise<boolean> {
    const encryptedPk = CryptoService.encryptEmail(pk);
    const result = await this.entityManager.find<ObraEntity>(
      ObraEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `obra#`,
        },
      },
    );

    const targetAt = (at || '').trim().toUpperCase();
    const obra = result.items.find(
      (o) =>
        !o.isDelete &&
        (((o.at || '').trim().toUpperCase() === targetAt) ||
          ((o.solicitudPo || '').trim().toUpperCase() === targetAt)),
    );

    if (obra && Array.isArray(obra.estimaciones)) {
      const numEstStr = String(numeroEstimacion || '').trim();
      obra.estimaciones = obra.estimaciones.filter(
        (e) => String(e.numeroEstimacion || '').trim() !== numEstStr,
      );
      await this.entityManager.update<ObraEntity>(
        ObraEntity,
        { pk: encryptedPk, sk: obra.sk },
        { estimaciones: obra.estimaciones } as Partial<ObraEntity>,
      );
      return true;
    }
    return false;
  }

  public async estimacionBlockDelete(pk: string, numeroContrato: string, numeroEstimacion: string): Promise<boolean> {
    const encryptedPk = CryptoService.encryptEmail(pk);
    const result = await this.entityManager.find<ObraEntity>(
      ObraEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `obra#`,
        },
      },
    );

    const matchedObras = result.items.filter(
      (item) => !item.isDelete && item.contrato && item.contrato.trim() === numeroContrato.trim(),
    );

    const numEstStr = String(numeroEstimacion || '').trim();
    for (const obra of matchedObras) {
      if (Array.isArray(obra.estimaciones)) {
        const filtered = obra.estimaciones.filter(
          (e) => String(e.numeroEstimacion || '').trim() !== numEstStr,
        );
        if (filtered.length !== obra.estimaciones.length) {
          obra.estimaciones = filtered;
          await this.entityManager.update<ObraEntity>(
            ObraEntity,
            { pk: encryptedPk, sk: obra.sk },
            { estimaciones: obra.estimaciones } as Partial<ObraEntity>,
          );
        }
      }
    }
    return true;
  }
}
