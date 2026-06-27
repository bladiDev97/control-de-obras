//Dependencies
import { DocumentClientTypes } from '@typedorm/document-client';

//Interfaces
import { IObra } from '../ientities/i-obra.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';

//DTOS
import { SearchDTO } from 'src/shared/application/dto/search.dto';

export interface IObraRepository {
  obraCreate(body: IObra): Promise<IObra>;
  obraUpdate(dto: IObra): Promise<IObra>;
  obraSearch(pk: string, dto: SearchDTO): Promise<[IObra[], DocumentClientTypes.Key]>;
  obraDetail(keys: IGeneric): Promise<IObra>;
  obraDelete(keys: IGeneric): Promise<IObra>;
  obraListAll(pk: string): Promise<IObra[]>;
}
