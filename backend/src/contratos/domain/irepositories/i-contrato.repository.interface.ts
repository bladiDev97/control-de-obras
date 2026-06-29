import { DocumentClientTypes } from '@typedorm/document-client';
import { IContrato } from '../ientities/i-contrato.interface';
import { IAsignacion } from '../ientities/i-asignacion.interface';
import { IEstimacion } from '../ientities/i-estimacion.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { SearchDTO } from 'src/shared/application/dto/search.dto';

export interface IContratoRepository {
  contratoCreate(body: IContrato): Promise<IContrato>;
  contratoUpdate(dto: IContrato): Promise<IContrato>;
  contratoSearch(pk: string, dto: SearchDTO): Promise<[IContrato[], DocumentClientTypes.Key]>;
  contratoDetail(keys: IGeneric): Promise<IContrato>;
  contratoDelete(keys: IGeneric): Promise<IContrato>;
  contratoListAll(pk: string): Promise<IContrato[]>;

  asignacionSave(body: IAsignacion): Promise<IAsignacion>;
  asignacionList(pk: string, numeroContrato: string): Promise<IAsignacion[]>;

  estimacionSave(body: IEstimacion): Promise<IEstimacion>;
  estimacionList(pk: string, numeroContrato: string): Promise<IEstimacion[]>;
}
