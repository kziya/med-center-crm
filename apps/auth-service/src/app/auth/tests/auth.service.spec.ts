import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommonPatientService } from '@med-center-crm/patient';
import { CommonUserService } from '@med-center-crm/user';
import { VerificationSuccessfulNotificationEvent } from '@med-center-crm/types';
import { EmailOrPasswordWrongException } from '../exceptions/email-or-password-wrong.exception';
import * as bcrypt from 'bcrypt';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { BadRequestException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let patientService: CommonPatientService;
  let userService: CommonUserService;
  let redis: Redis;
  let queue: Queue;

  const mockUser = {
    user_id: 1,
    email: 'test@example.com',
    password_hash: 'hashedpassword',
    role: 'PATIENT',
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const mock = {
                JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
                JWT_REFRESH_TOKEN_TTL: '1h',
              };
              return mock[key];
            }),
          },
        },
        {
          provide: CommonPatientService,
          useValue: { createPatient: jest.fn() },
        },
        {
          provide: CommonUserService,
          useValue: {
            findByEmail: jest.fn(),
            verifyUser: jest.fn(),
          },
        },
        {
          provide: 'BullQueue_verification_successful_notification_queue',
          useValue: { add: jest.fn() },
        },
        {
          provide: Redis,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jwtService = moduleRef.get(JwtService);
    patientService = moduleRef.get(CommonPatientService);
    userService = moduleRef.get(CommonUserService);
    queue = moduleRef.get(
      'BullQueue_verification_successful_notification_queue'
    );
    redis = moduleRef.get(Redis);
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'email', password: 'pass' })
      ).rejects.toThrow(EmailOrPasswordWrongException);
    });

    it('should throw if password is invalid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'email', password: 'wrong' })
      ).rejects.toThrow(EmailOrPasswordWrongException);
    });

    it('should return tokens if valid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('token');

      const result = await service.login({ email: 'email', password: 'pass' });

      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });
  });

  describe('register', () => {
    it('should return tokens for new user', async () => {
      (patientService.createPatient as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token');

      const result = await service.register({} as any);
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens if valid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockResolvedValue(mockUser);
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token');

      const result = await service.refreshToken('refresh');
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });

    it('should throw if token invalid', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      await expect(service.refreshToken('bad')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw if user not found', async () => {
      (jwtService.verify as jest.Mock).mockResolvedValue(mockUser);
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(service.refreshToken('valid')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('verifyUser', () => {
    it('should verify and queue event', async () => {
      (redis.get as jest.Mock).mockResolvedValue('1');
      await service.verifyUser('uid');

      expect(userService.verifyUser).toHaveBeenCalledWith(1);
      expect(queue.add).toHaveBeenCalled();
    });

    it('should throw if redis key not found', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      await expect(service.verifyUser('bad')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
