import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface CurrentUserType {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: CurrentUserType }>();
    return request.user;
  },
);
