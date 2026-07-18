import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ZonasService } from '../../domain/services/zonas.service';
import { IZona } from '../../domain/ientities/i-zona.interface';

@Controller('zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Post()
  async create(@Body() zona: Partial<IZona>) {
    return this.zonasService.create(zona);
  }

  @Get()
  async findAll() {
    return this.zonasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.zonasService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() zona: Partial<IZona>) {
    return this.zonasService.update(id, zona);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.zonasService.delete(id);
  }
}
