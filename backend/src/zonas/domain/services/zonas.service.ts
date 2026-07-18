import { Inject, Injectable } from '@nestjs/common';
import { IZonasRepository } from '../irepositories/i-zonas.repository';
import { IZona } from '../ientities/i-zona.interface';

@Injectable()
export class ZonasService {
  constructor(
    @Inject('IZonasRepository')
    private readonly zonasRepository: IZonasRepository,
  ) {}

  async create(zona: Partial<IZona>): Promise<IZona> {
    return this.zonasRepository.create(zona);
  }

  async findAll(): Promise<IZona[]> {
    return this.zonasRepository.findAll();
  }

  async findById(id: string): Promise<IZona | null> {
    return this.zonasRepository.findById(id);
  }

  async update(id: string, zona: Partial<IZona>): Promise<IZona> {
    return this.zonasRepository.update(id, zona);
  }

  async delete(id: string): Promise<boolean> {
    return this.zonasRepository.delete(id);
  }
}
