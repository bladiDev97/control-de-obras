//Dependencies
import { HttpStatus } from '@nestjs/common';

export const Errors = {
  // Generic Repository Errors /
  GenericRepository: {
    EntityNotFound: {
      errorCode: `GRENF-0`,
      message: `Entity with id '$param$' not found`,
      httpStatus: HttpStatus.BAD_REQUEST,
      description: 'Entity not found',
    },
    ConstraintError: {
      errorCode: `GRNEF-1`,
      message: `entity with pk '$param$' not found`,
      httpStatus: HttpStatus.BAD_REQUEST,
      description: 'Entity not found at insert',
    },
    UniqueCodeError: {
      errorCode: `GRUQ-2`,
      message: `value '$param$' already exists`,
      httpStatus: HttpStatus.BAD_REQUEST,
      description: 'Unique Code error',
    },
    NotNullValues: {
      errorCode: `GRNNV-3`,
      message: `not null values`,
      httpStatus: HttpStatus.BAD_REQUEST,
      description: 'Not null values',
    },
  },

  // Redis Generic /
  RedisGenericRepository: {
    NoConnection: {
      errorCode: `RGRNC-0`,
      message: `Connection fail`,
      httpStatus: HttpStatus.BAD_REQUEST,
      description: 'Redis connection fail',
    },
  },

  // Auth Errors /
  Auth: {
    InvalidCredentials: {
      errorCode: `AUIC-0`,
      message: `Invalid Credentials`,
      httpStatus: HttpStatus.BAD_REQUEST,
      description: 'Invalid Credentials',
    },
    UserNotExistsOnDB: {
      errorCode: `AUUNE-1`,
      message: `Unauthorized`,
      httpStatus: HttpStatus.UNAUTHORIZED,
      description: 'Valid Token but user does not exists on db',
    },
    TokenExpired: {
      errorCode: `AUTE-2`,
      message: `Unauthorized`,
      httpStatus: HttpStatus.UNAUTHORIZED,
      description: 'Token not exists on db or it is expired',
    },

    EmailDuplicate: {
      errorCode: `AUTE-3`,
      message: `Unauthorized`,
      httpStatus: HttpStatus.UNAUTHORIZED,
      description: 'This email already exists',
    },

    ActivationFailed: {
      errorCode: `AUTE-4`,
      message: `Unauthorized`,
      httpStatus: HttpStatus.UNAUTHORIZED,
      description: 'Activation failed',
    },

    EmailMatchNotFound: {
      errorCode: `AUTE-5`,
      message: `Unauthorized`,
      httpStatus: HttpStatus.UNAUTHORIZED,
      description: 'Email match not found',
    },
    PasswordMatchNotFound: {
      errorCode: `AUTE-6`,
      message: `Unauthorized`,
      httpStatus: HttpStatus.UNAUTHORIZED,
      description: 'Password match not found',
    },
  },
};
