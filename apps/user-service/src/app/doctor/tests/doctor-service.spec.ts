import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from '../doctor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Users,
  CreateDoctorDto,
  UpdateUserGeneralDto,
  UpdateUserContactDto,
  UserRole,
} from '@med-center-crm/types';
import { CommonUserService } from '@med-center-crm/user';
import { ForbiddenException } from '@nestjs/common';
import { UserTokenPayload } from '@med-center-crm/auth';
import { createMock } from '@golevelup/ts-jest';

describe('DoctorService', () => {
  let service: DoctorService;
  let commonUserService: jest.Mocked<CommonUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            manager: {
              transaction: jest.fn().mockImplementation(async (cb) =>
                cb({
                  save: jest.fn(), // mock save for DoctorDetails
                })
              ),
            },
          },
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<DoctorService>(DoctorService);
    commonUserService = module.get(CommonUserService);
  });

  describe('createDoctor', () => {
    it('should create user and doctor details inside transaction', async () => {
      const dto: CreateDoctorDto = {
        email: 'doc@mail.com',
        password: '1234',
        firstName: 'Jane',
        lastName: 'Doe',
        details: {
          specialty: 'Cardiology',
          license_number: 'MD123456',
        },
      } as any;

      const expectedUser = { user_id: 42 } as Users;

      commonUserService.createUser.mockResolvedValue(expectedUser);

      const result = await service.createDoctor(dto);

      expect(commonUserService.createUser).toHaveBeenCalled();
      expect(result).toBe(expectedUser);
    });
  });

  describe('updateDoctorGeneral', () => {
    it('should allow update if doctor updates their own info', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.DOCTOR } as any;
      const dto: UpdateUserGeneralDto = { firstName: 'Updated' } as any;

      await service.updateDoctorGeneral(payload, 1, dto);

      expect(commonUserService.updateUserGeneral).toHaveBeenCalledWith(
        expect.anything(),
        1,
        dto
      );
    });

    it('should throw ForbiddenException if doctor updates another user', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.DOCTOR } as any;
      const dto: UpdateUserGeneralDto = { firstName: 'Blocked' } as any;

      await expect(
        service.updateDoctorGeneral(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateDoctorContact', () => {
    it('should allow update if doctor updates their own contact info', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.DOCTOR } as any;
      const dto: UpdateUserContactDto = { phone: '+123456789' } as any;

      await service.updateDoctorContact(payload, 1, dto);

      expect(commonUserService.updateUserContact).toHaveBeenCalledWith(
        expect.anything(),
        1,
        dto
      );
    });

    it('should throw ForbiddenException if doctor updates another user', async () => {
      const payload: UserTokenPayload = { id: 1, role: UserRole.DOCTOR } as any;
      const dto: UpdateUserContactDto = { phone: '+999999999' } as any;

      await expect(
        service.updateDoctorContact(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
