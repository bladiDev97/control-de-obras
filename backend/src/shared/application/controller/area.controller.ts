import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Routes } from '../../routes/routes.constants';
import { AreaService } from '../../domain/services/area.service';
import { JsonResponse } from '../model/json-response.class';

@ApiTags(Routes.Areas.ApiTags)
@Controller(Routes.Areas.Controller)
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Get(Routes.Areas.GetAll)
  public async getAll(@Res() response: Response): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.areaService.getAll(pk);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Areas retrieved successfully',
    });
    response.status(HttpStatus.OK).send(jsonResponse);
    return jsonResponse;
  }

  @Post(Routes.Areas.Create)
  public async create(@Res() response: Response, @Body() body: { nombreArea: string }): Promise<any> {
    const pk = 'bladi.PigeonSave@gmail.com';
    const result = await this.areaService.create(pk, body.nombreArea);
    const jsonResponse = new JsonResponse({
      data: result,
      message: 'Area created successfully',
    });
    response.status(HttpStatus.CREATED).send(jsonResponse);
    return jsonResponse;
  }
}
