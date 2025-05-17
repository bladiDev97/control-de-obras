//Dependencies
import { HttpException } from '@nestjs/common';

interface ICustomError {
  errorCode: string;
  message: string;
  httpStatus: number;
  description?: string;
}

export class ThrowError {
  static httpException(error: ICustomError, params?: string[]): never {
    let messageParams = error.message;

    if (params?.length) {
      for (let i = 0; i < params.length; i++) {
        messageParams = messageParams.replace('$param$', params[i]);
      }
    }

    throw new HttpException(
      {
        message: messageParams,
        code: error.errorCode,
        description: error.description,
      },
      error.httpStatus,
    );
  }

  // static rpcException(error: ErrorResponse): void {
  //   throw new RpcException(
  //     new HttpException(
  //       {
  //         message: `${error.errorCode}-${error.message}`,
  //       },
  //       error.httpStatus,
  //     ),
  //   );
  // }
}
