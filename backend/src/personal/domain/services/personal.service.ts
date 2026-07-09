import { Injectable, Logger } from '@nestjs/common';
import { IPersonal } from '../ientities/i-personal.interface';
import { IGeneric } from 'src/shared/domain/ientities/i-generic.interface';
import { PersonalRepository } from '../../infrastructure/repositories/personal.repository';
import { PersonalCreateDto } from '../../application/dto/personal.create.dto';
import { PersonalUpdateDto } from '../../application/dto/personal.update.dto';

@Injectable()
export class PersonalService {
  private readonly logger = new Logger(PersonalService.name);

  constructor(private readonly personalRepository: PersonalRepository) {}

  public async getAll(pk: string): Promise<IPersonal[]> {
    const items = await this.personalRepository.personalListAll(pk);
    return items.map((item) => {
      const id = item.sk ? item.sk.replace('personal#', '') : '';
      return {
        ...item,
        id,
      };
    });
  }

  public async getOne(pk: string, rpe: string): Promise<IPersonal> {
    const keys: IGeneric = { pk, sk: rpe };
    const item = await this.personalRepository.personalDetail(keys);
    return {
      ...item,
      id: rpe,
    };
  }

  public async create(pk: string, dto: PersonalCreateDto): Promise<IPersonal> {
    const personalData: IPersonal = {
      pk,
      rpe: dto.rpe,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      cargo: dto.cargo,
      correo: dto.correo,
      zona: dto.zona,
      isDelete: false,
    };
    const created = await this.personalRepository.personalCreate(personalData);
    return {
      ...created,
      id: dto.rpe,
    };
  }

  public async update(pk: string, dto: PersonalUpdateDto): Promise<IPersonal> {
    const keys: IGeneric = { pk, sk: dto.rpe };
    const existing = await this.personalRepository.personalDetail(keys);

    const personalData: IPersonal = {
      pk,
      sk: `personal#${dto.rpe}`,
      rpe: dto.rpe,
      nombres: dto.nombres !== undefined ? dto.nombres : existing.nombres,
      apellidoPaterno: dto.apellidoPaterno !== undefined ? dto.apellidoPaterno : existing.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno !== undefined ? dto.apellidoMaterno : existing.apellidoMaterno,
      cargo: dto.cargo !== undefined ? dto.cargo : existing.cargo,
      correo: dto.correo !== undefined ? dto.correo : existing.correo,
      zona: dto.zona !== undefined ? dto.zona : existing.zona,
    };

    const updated = await this.personalRepository.personalUpdate(personalData);
    return {
      ...updated,
      id: dto.rpe,
    };
  }

  public async delete(pk: string, rpe: string): Promise<IPersonal> {
    const keys: IGeneric = { pk, sk: rpe };
    const deleted = await this.personalRepository.personalDelete(keys);
    return {
      ...deleted,
      id: rpe,
    };
  }
}
