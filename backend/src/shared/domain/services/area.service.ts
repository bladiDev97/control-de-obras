import { Injectable, Logger } from '@nestjs/common';
import { AreaRepository } from '../../infrastructure/repositories/area.repository';
import { AreaEntity } from '../../infrastructure/entities/area.entity';

@Injectable()
export class AreaService {
  private readonly logger = new Logger(AreaService.name);

  constructor(private readonly areaRepository: AreaRepository) {}

  public async getAll(pk: string): Promise<AreaEntity[]> {
    let list = await this.areaRepository.areaListAll(pk);
    
    // Seed defaults if empty
    if (list.length === 0) {
      this.logger.log(`No areas found for pk ${pk}. Seeding default zones...`);
      const defaults = [
        'PÁTZCUARO REVOLUCIÓN',
        'PÁTZCUARO SUR',
        'ARIO DE ROSALES',
        'TACÁMBARO'
      ];
      for (const name of defaults) {
        try {
          await this.areaRepository.areaCreate(pk, name);
        } catch (err) {
          this.logger.error(`Error seeding area: ${name}`, err);
        }
      }
      list = await this.areaRepository.areaListAll(pk);
    }
    
    return list.map(item => {
      item.area = item.area || item.nombreArea || '';
      item.nombreArea = item.nombreArea || item.area || '';
      return item;
    });
  }

  public async create(pk: string, nombreArea: string): Promise<AreaEntity> {
    const formattedName = nombreArea.trim().toUpperCase();
    return await this.areaRepository.areaCreate(pk, formattedName);
  }
}
