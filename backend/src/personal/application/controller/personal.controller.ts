import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiParam } from '@nestjs/swagger';

// Routes
import { Routes } from 'src/shared/routes/routes.constants';

// Services
import { PersonalService } from '../../domain/services/personal.service';

// DTOs
import { PersonalCreateDto } from '../dto/personal.create.dto';
import { PersonalUpdateDto } from '../dto/personal.update.dto';

// Models / Utils
import { JsonResponse } from 'src/shared/application/model/json-response.class';

@ApiTags(Routes.Personal.ApiTags)
@Controller(Routes.Personal.Controller)
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  /** List all Personal */
  @Get(Routes.Personal.GetAll)
  public async getAll(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com'; // Shared base email pk placeholder
    const result = await this.personalService.getAll(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'All personnel retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Get personal detail */
  @Get(Routes.Personal.GetOne)
  @ApiParam({ name: 'id', required: true, description: 'RPE of the CFE employee' })
  public async getOne(@Res() response: Response, @Param('id') id: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.personalService.getOne(pk, id);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Personnel details retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Create personal record */
  @Post(Routes.Personal.Create)
  public async create(@Res() response: Response, @Body() dto: PersonalCreateDto): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.personalService.create(pk, dto);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Personnel registered successfully',
    });
    response.status(HttpStatus.CREATED).send(jsonResponse);
    return jsonResponse;
  }

  /** Update personal record */
  @Post(Routes.Personal.Update)
  public async update(@Res() response: Response, @Body() dto: PersonalUpdateDto): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.personalService.update(pk, dto);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Personnel updated successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  /** Delete personal record */
  @Delete(Routes.Personal.Delete)
  @ApiParam({ name: 'id', required: true, description: 'RPE of the CFE employee to delete' })
  public async delete(@Res() response: Response, @Param('id') id: string): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.personalService.delete(pk, id);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Personnel deleted successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }
}
