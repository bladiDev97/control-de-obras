import { IZona } from '../ientities/i-zona.interface';

export interface IZonasRepository {
  create(zona: Partial<IZona>): Promise<IZona>;
  findAll(): Promise<IZona[]>;
  findById(id: string): Promise<IZona | null>;
  update(id: string, zona: Partial<IZona>): Promise<IZona>;
  delete(id: string): Promise<boolean>;
}
