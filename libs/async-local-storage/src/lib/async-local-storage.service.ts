import { AsyncLocalStorage } from 'async_hooks';
import { UserTokenPayload } from '@med-center-crm/types';

export class AsyncLocalStorageService {
  private readonly asyncLocalStorage: AsyncLocalStorage<any> =
    new AsyncLocalStorage();

  async getTokenPayloadAndIpAddress(): Promise<{
    tokenPayload?: UserTokenPayload;
    ipAddress?: string;
  }> {
    const store = await this.asyncLocalStorage.getStore();

    return {
      tokenPayload: store.user,
      ipAddress: store.ipAddress,
    };
  }

  run(contextData: any, callback: () => void): void {
    this.asyncLocalStorage.run(contextData, callback);
  }
}
