import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { createMock } from '@golevelup/ts-jest';
import { CommonUserService } from '@med-center-crm/user';
import { CommonPatientService } from '@med-center-crm/patient';
import { EmailOrPasswordWrongException } from '../exceptions/email-or-password-wrong.exception';
import * as bcrypt from 'bcrypt';
import { Users } from '@med-center-crm/types';
import { JwtService } from '@nestjs/jwt';
import MockedObject = jest.MockedObject;
import { BadRequestException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let commonUserService: CommonUserService;
  let commonPatientService: CommonPatientService;
  let jwtService: MockedObject<JwtService>;

  const mockUser = {
    user_id: 1,
    email: 'test@example.com',
    password_hash: 'hashedpassword',
    role: 'PATIENT',
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(createMock)
      .compile();

    authService = moduleRef.get<AuthService>(AuthService);
    commonUserService = moduleRef.get(CommonUserService);
    commonPatientService = moduleRef.get(CommonPatientService);
    jwtService = moduleRef.get(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(commonUserService, 'findByEmail').mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'email',
          password: 'pass',
        })
      ).rejects.toThrow(EmailOrPasswordWrongException);
    });

    it('should throw if password is incorrect', async () => {
      jest
        .spyOn(commonUserService, 'findByEmail')
        .mockResolvedValue(mockUser as Users);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'email',
          password: 'wrongpass',
        })
      ).rejects.toThrow(EmailOrPasswordWrongException);
    });

    it('should return access and refresh tokens if login is successful', async () => {
      jest
        .spyOn(commonUserService, 'findByEmail')
        .mockResolvedValue(mockUser as Users);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('signed-token' as never)
        .mockReturnValueOnce('signed-token' as never);

      const result = await authService.login({
        email: 'email',
        password: 'correctpass',
      });

      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });
  });

  describe('register', () => {
    it('should return tokens for a registered user', async () => {
      jest
        .spyOn(commonPatientService, 'createPatient')
        .mockResolvedValue(mockUser as Users);

      const dto = {
        email: 'test@example.com',
        password: '123456',
      } as any;

      jwtService.sign
        .mockReturnValueOnce('signed-token' as never)
        .mockReturnValueOnce('signed-token' as never);

      const result = await authService.register(dto);

      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });
  });

  describe('refreshToken', () => {
    it('should return tokens if refresh token is valid and user exists', async () => {
      const payload = {
        id: mockUser.user_id,
        email: mockUser.email,
        role: mockUser.role,
      };

      jest.spyOn(jwtService, 'verify').mockResolvedValue(payload as never);

      jest
        .spyOn(commonUserService, 'findByEmail')
        .mockResolvedValue(mockUser as Users);

      jwtService.sign
        .mockReturnValueOnce('new-access-token' as never)
        .mockReturnValueOnce('new-refresh-token' as never);

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw BadRequestException if token is invalid or expired', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      const payload = {
        id: 123,
        email: 'nonexistent@example.com',
        role: 'PATIENT',
      };

      jest.spyOn(jwtService, 'verify').mockResolvedValue(payload as never);

      jest.spyOn(commonUserService, 'findByEmail').mockResolvedValue(null);

      await expect(
        authService.refreshToken('valid-token-but-no-user')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
