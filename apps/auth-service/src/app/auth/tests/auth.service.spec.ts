import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { createMock } from '@golevelup/ts-jest';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(createMock)
      .compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});
