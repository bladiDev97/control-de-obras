import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { ContratoService } from './domain/services/contrato.service';
import { ContratoRepository } from './infrastructure/repositories/contrato.repository';
import { ContratoController } from './application/controller/contrato.controller';

@Module({
  imports: [SharedModule],
  controllers: [ContratoController],
  providers: [ContratoService, ContratoRepository],
  exports: [ContratoService, ContratoRepository],
})
export class ContratosModule {}
