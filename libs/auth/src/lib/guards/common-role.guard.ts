import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

import { UserRole, UserTokenPayload } from '@med-center-crm/types';
import { ROLES_KEY } from '../decorators';

@Injectable()
export class CommonRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles.length) {
      return true;
    }

    const user = context.switchToHttp().getRequest()?.user as UserTokenPayload;

    return roles.includes(user?.role);
  }
}
