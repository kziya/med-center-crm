import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Users,
  CreateUserDto,
  UpdateUserGeneralDto,
  UpdateUserContactDto,
  UserRole,
} from '@med-center-crm/types';
import { CommonUserService } from '@med-center-crm/user';
import { ForbiddenException } from '@nestjs/common';
import { UserTokenPayload } from '@med-center-crm/auth';
import { createMock } from '@golevelup/ts-jest';

describe('AdminService', () => {
  let service: AdminService;
  let commonUserService: jest.Mocked<CommonUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            manager: {
              transaction: jest.fn().mockImplementation(async (cb) => cb({})),
            },
          },
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<AdminService>(AdminService);
    commonUserService = module.get(CommonUserService);
  });

  describe('createAdmin', () => {
    it('should create admin using commonUserService inside a transaction', async () => {
      const dto: CreateUserDto = {
        email: 'admin@example.com',
        password: 'securepass',
        firstName: 'Admin',
        lastName: 'User',
      } as any;

      const expectedUser = { user_id: 100 } as Users;
      commonUserService.createUser.mockResolvedValue(expectedUser);

      const result = await service.createAdmin(dto);

      expect(commonUserService.createUser).toHaveBeenCalledWith(
        expect.anything(),
        dto
      );
      expect(result).toBe(expectedUser);
    });
  });

  describe('updateAdminGeneral', () => {
    it('should allow admin to update their own profile', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.ADMIN } as any;
      const dto: UpdateUserGeneralDto = { firstName: 'SuperAdmin' } as any;

      await service.updateAdminGeneral(payload, 1, dto);

      expect(commonUserService.updateUserGeneral).toHaveBeenCalledWith(
        expect.anything(),
        1,
        dto
      );
    });

    it('should throw ForbiddenException when admin tries to update another user', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.ADMIN } as any;
      const dto: UpdateUserGeneralDto = { firstName: 'Hacker' } as any;

      await expect(service.updateAdminGeneral(payload, 2, dto)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('updateAdminContact', () => {
    it('should allow admin to update their own contact', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.ADMIN } as any;
      const dto: UpdateUserContactDto = { phone: '+380991112233' } as any;

      await service.updateAdminContact(payload, 1, dto);

      expect(commonUserService.updateUserContact).toHaveBeenCalledWith(
        expect.anything(),
        1,
        dto
      );
    });

    it('should throw ForbiddenException when admin tries to update another user', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.ADMIN } as any;
      const dto: UpdateUserContactDto = { phone: '+380999999999' } as any;

      await expect(service.updateAdminContact(payload, 2, dto)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
