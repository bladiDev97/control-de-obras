import { EntityManager } from '@typedorm/core';
import { Inject, Injectable } from '@nestjs/common';
import { DocumentClientTypes } from '@typedorm/document-client';
import { ContratoEntity } from '../entities/contrato.entity';
import { AsignacionEntity } from '../entities/asignacion.entity';
import { EstimacionEntity } from '../entities/estimacion.entity';
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
  public async asignacionSave(body: IAsignacion): Promise<AsignacionEntity> {
    const rawPk = body.pk;
    const encryptedPk = CryptoService.encryptEmail(rawPk);
    const sk = `asignacion#${body.numeroContrato}#${body.at}`;

    const entity = Object.assign(new AsignacionEntity(), body);
    entity.pk = encryptedPk;
    entity.sk = sk;
    entity.isDelete = false;

    let existing: AsignacionEntity | null = null;
    try {
      existing = await this.entityManager.findOne<AsignacionEntity, Partial<AsignacionEntity>>(AsignacionEntity, { pk: encryptedPk, sk });
    } catch {
      // ignore
    }

    let saved: AsignacionEntity;
    if (existing) {
      const { pk, sk: itemSk, ...propertiesUpdate } = entity;
      saved = await this.entityManager.update<AsignacionEntity>(
        AsignacionEntity,
        { pk: encryptedPk, sk },
        propertiesUpdate as AsignacionEntity
      );
    } else {
      saved = await this.entityManager.create<AsignacionEntity>(entity);
    }
    saved.pk = CryptoService.decryptEmail(saved.pk);
    return saved;
  }

  public async asignacionList(pk: string, numeroContrato: string): Promise<AsignacionEntity[]> {
    const encryptedPk = CryptoService.encryptEmail(pk);
    const result = await this.entityManager.find<AsignacionEntity>(
      AsignacionEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `asignacion#${numeroContrato}#`
        }
      }
    );
    return result.items.map(item => {
      item.pk = CryptoService.decryptEmail(item.pk);
      return item;
    }).filter(item => !item.isDelete);
  }

  // --- Estimaciones ---
  public async estimacionSave(body: IEstimacion): Promise<EstimacionEntity> {
    const rawPk = body.pk;
    const encryptedPk = CryptoService.encryptEmail(rawPk);
    const sk = `estimacion#${body.numeroContrato}#${body.at}#${body.numeroEstimacion}`;

    const entity = Object.assign(new EstimacionEntity(), body);
    entity.pk = encryptedPk;
    entity.sk = sk;
    entity.isDelete = false;

    let existing: EstimacionEntity | null = null;
    try {
      existing = await this.entityManager.findOne<EstimacionEntity, Partial<EstimacionEntity>>(EstimacionEntity, { pk: encryptedPk, sk });
    } catch {
      // ignore
    }

    let saved: EstimacionEntity;
    if (existing) {
      const { pk, sk: itemSk, ...propertiesUpdate } = entity;
      saved = await this.entityManager.update<EstimacionEntity>(
        EstimacionEntity,
        { pk: encryptedPk, sk },
        propertiesUpdate as EstimacionEntity
      );
    } else {
      saved = await this.entityManager.create<EstimacionEntity>(entity);
    }
    saved.pk = CryptoService.decryptEmail(saved.pk);
    return saved;
  }

  public async estimacionList(pk: string, numeroContrato: string): Promise<EstimacionEntity[]> {
    const encryptedPk = CryptoService.encryptEmail(pk);
    const result = await this.entityManager.find<EstimacionEntity>(
      EstimacionEntity,
      encryptedPk,
      {
        keyCondition: {
          BEGINS_WITH: `estimacion#${numeroContrato}#`
        }
      }
    );
    return result.items.map(item => {
      item.pk = CryptoService.decryptEmail(item.pk);
      return item;
    }).filter(item => !item.isDelete);
  }

  public async estimacionDelete(pk: string, numeroContrato: string, at: string, numeroEstimacion: string): Promise<boolean> {
    const encryptedPk = CryptoService.encryptEmail(pk);
    const sk = `estimacion#${numeroContrato}#${at}#${numeroEstimacion}`;
    try {
      await this.entityManager.delete<EstimacionEntity>(EstimacionEntity, { pk: encryptedPk, sk });
      return true;
    } catch {
      return false;
    }
  }

  public async estimacionBlockDelete(pk: string, numeroContrato: string, numeroEstimacion: string): Promise<boolean> {
    const list = await this.estimacionList(pk, numeroContrato);
    const matched = list.filter(item => String(item.numeroEstimacion) === String(numeroEstimacion));
    for (const item of matched) {
      const encryptedPk = CryptoService.encryptEmail(pk);
      await this.entityManager.delete<EstimacionEntity>(EstimacionEntity, { pk: encryptedPk, sk: item.sk });
    }
    return true;
  }
}
