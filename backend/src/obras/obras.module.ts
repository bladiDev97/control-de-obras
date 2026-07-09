//Dependencies
import { Module } from '@nestjs/common';

//Modules
import { SharedModule } from 'src/shared/shared.module';
import { ContratosModule } from '../contratos/contratos.module';
import { PersonalModule } from '../personal/personal.module';

//Services
import { ObraService } from './domain/services/obra.service';

//Repository
import { ObraRepository } from './infrastructure/repositories/obra.repository';

//Controllers
import { ObraController } from './application/controller/obra.controller';

@Module({
  imports: [SharedModule, ContratosModule, PersonalModule],
  controllers: [ObraController],
  providers: [ObraService, ObraRepository],
  exports: [ObraService],
})
export class ObrasModule {}
