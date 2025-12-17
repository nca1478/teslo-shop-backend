import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): unknown => {
    const req: { user: Record<string, unknown> } = ctx
      .switchToHttp()
      .getRequest();
    const user = req.user;

    return data ? user?.[data] : user;
  },
);
