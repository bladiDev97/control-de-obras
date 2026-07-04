import { DocumentClientTypes } from '@typedorm/document-client';
import { IPersonal } from '../ientities/i-personal.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { SearchDTO } from 'src/shared/application/dto/search.dto';

export interface IPersonalRepository {
  personalCreate(body: IPersonal): Promise<IPersonal>;
  personalUpdate(dto: IPersonal): Promise<IPersonal>;
  personalSearch(pk: string, dto: SearchDTO): Promise<[IPersonal[], DocumentClientTypes.Key]>;
  personalDetail(keys: IGeneric): Promise<IPersonal>;
  personalDelete(keys: IGeneric): Promise<IPersonal>;
  personalListAll(pk: string): Promise<IPersonal[]>;
}
