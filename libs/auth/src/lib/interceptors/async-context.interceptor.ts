import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { UserTokenPayload } from '../types';
import { AsyncLocalStorageService } from '@med-center-crm/async-local-storage';

@Injectable()
export class SetAsyncContextInterceptor implements NestInterceptor {
  constructor(private readonly asyncStorage: AsyncLocalStorageService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const contextData: { user?: UserTokenPayload } = {};

    if (request.user) {
      contextData.user = request.user;
    }

    return new Observable((observer) => {
      this.asyncStorage.run(contextData, () => {
        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
