//Dependencies
import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseMetadata, getSchemaPath } from '@nestjs/swagger';

export const ApiJsonResponse = (apiOptions: ApiResponseMetadata) => {
  return applyDecorators(
    ApiResponse({
      status: apiOptions.status,
      description: apiOptions.description,
      schema: {
        properties: {
          succeed: {
            type: 'boolean',
          },
          message: {
            type: 'string',
          },
          created: {
            type: 'string',
            format: 'date-time',
          },
          data: Array.isArray(apiOptions.type as unknown)
            ? { type: 'array', items: { $ref: getSchemaPath(apiOptions.type[0]) as string } }
            : { $ref: getSchemaPath(apiOptions.type as string) },
        },
      },
    }),
  );
};
