import { Module } from '@nestjs/common';
import { ZonasController } from './application/controllers/zonas.controller';
import { ZonasService } from './domain/services/zonas.service';
import { ZonasRepository } from './infrastructure/repositories/zonas.repository';

@Module({
  controllers: [ZonasController],
  providers: [
    ZonasService,
    {
      provide: 'IZonasRepository',
      useClass: ZonasRepository,
    },
  ],
  exports: [ZonasService],
})
export class ZonasModule {}
