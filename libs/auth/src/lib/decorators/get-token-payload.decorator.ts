import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserTokenPayload = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return req.user;
  }
);
