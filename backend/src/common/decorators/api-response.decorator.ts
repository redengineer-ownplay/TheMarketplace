import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const ApiSuccessResponse = <T extends Type<any>>(
  status: number,
  description: string,
  type?: T,
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      type: type,
    }),
  );
};
