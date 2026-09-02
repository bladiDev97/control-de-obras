//Dependencies
import { Module, Global } from '@nestjs/common';
import { connection } from './infrastructure/database/typedorm.config';
import { MailService } from './services/mail.service';
import { PdfService } from './services/pdf.service';
import { S3Service } from './services/s3.service';
import { ConfigRepository } from './infrastructure/repositories/config.repository';
import { ConfigService } from './domain/services/config.service';
import { ConfigController } from './application/controller/config.controller';
import { AreaRepository } from './infrastructure/repositories/area.repository';
import { AreaService } from './domain/services/area.service';
import { AreaController } from './application/controller/area.controller';

@Global()
@Module({
  controllers: [ConfigController, AreaController],
  providers: [
    {
      provide: 'ENTITY_MANAGER',
      useValue: connection.entityManager,
    },
    MailService,
    PdfService,
    S3Service,
    ConfigRepository,
    ConfigService,
    AreaRepository,
    AreaService,
  ],
  exports: ['ENTITY_MANAGER', MailService, PdfService, S3Service, ConfigRepository, ConfigService, AreaRepository, AreaService],
})
export class SharedModule {}
