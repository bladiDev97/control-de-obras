import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { PersonalService } from './domain/services/personal.service';
import { PersonalRepository } from './infrastructure/repositories/personal.repository';
import { PersonalController } from './application/controller/personal.controller';

@Module({
  imports: [SharedModule],
  controllers: [PersonalController],
  providers: [PersonalService, PersonalRepository],
  exports: [PersonalService, PersonalRepository],
})
export class PersonalModule {}
