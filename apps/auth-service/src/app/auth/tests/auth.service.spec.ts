import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommonPatientService } from '@med-center-crm/patient';
import { CommonUserService } from '@med-center-crm/user';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import {
  ResetPasswordSendNotificationEvent,
  ResetPasswordSuccessfulNotificationEvent,
  Users,
  VerificationSendNotificationEvent,
  VerificationSuccessfulNotificationEvent,
} from '@med-center-crm/types';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { EmailOrPasswordWrongException } from '../exceptions/email-or-password-wrong.exception';
import { getQueueToken } from '@nestjs/bullmq';

jest.mock('ioredis');

describe('AuthService', () => {
  let service: AuthService;
  let commonUserService: jest.Mocked<CommonUserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const map = {
                JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
                JWT_REFRESH_TOKEN_TTL: '1d',
              };
              return map[key];
            }),
          },
        },
        {
          provide: CommonPatientService,
          useValue: {
            createPatient: jest.fn(),
          },
        },
        {
          provide: CommonUserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            verifyUser: jest.fn(),
            updateUserGeneral: jest.fn(),
          },
        },
        {
          provide: Redis,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: getQueueToken(VerificationSuccessfulNotificationEvent.queue),
          useValue: { add: jest.fn() },
        },
        {
          provide: getQueueToken(VerificationSendNotificationEvent.queue),
          useValue: { add: jest.fn() },
        },
        {
          provide: getQueueToken(
            ResetPasswordSuccessfulNotificationEvent.queue
          ),
          useValue: { add: jest.fn() },
        },
        {
          provide: getQueueToken(ResetPasswordSendNotificationEvent.queue),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    getQueueToken();

    service = module.get<AuthService>(AuthService);
    commonUserService = module.get(CommonUserService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should return auth result on valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const user: Users = {
        user_id: 1,
        email: 'user@example.com',
        role: 'PATIENT',
        password_hash: await bcrypt.hash('password123', 10),
      } as any as Users;

      commonUserService.findByEmail.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('access-token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw if email not found', async () => {
      commonUserService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'fail@example.com', password: '123456' })
      ).rejects.toThrow(EmailOrPasswordWrongException);
    });

    it('should throw if password is wrong', async () => {
      const user = {
        email: 'user@example.com',
        password_hash: await bcrypt.hash('otherpass', 10),
      } as Users;

      commonUserService.findByEmail.mockResolvedValue(user);
      await expect(
        service.login({ email: 'user@example.com', password: 'wrong' })
      ).rejects.toThrow(EmailOrPasswordWrongException);
    });
  });

  describe('verifyUser', () => {
    it('should call verifyUser on correct UID', async () => {
      const redis = (service as any).redis as jest.Mocked<Redis>;
      redis.get.mockResolvedValue('42');

      await service.verifyUser('some-uid');

      expect(commonUserService.verifyUser).toHaveBeenCalledWith(42);
    });

    it('should throw BadRequest if UID not found', async () => {
      const redis = (service as any).redis as jest.Mocked<Redis>;
      redis.get.mockResolvedValue(null);

      await expect(service.verifyUser('missing')).rejects.toThrow();
    });
  });
});
