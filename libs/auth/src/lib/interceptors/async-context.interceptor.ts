import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AsyncLocalStorage } from 'async_hooks';

import { UserTokenPayload } from '../types';

@Injectable()
export class SetAsyncContextInterceptor implements NestInterceptor {
  constructor(private readonly asyncStorage: AsyncLocalStorage<any>) {}

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
