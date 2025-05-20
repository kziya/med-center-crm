import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from '../doctor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  CreateDoctorDto,
  DoctorDetails,
  UpdateDoctorDetailsDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserRole,
  Users,
  UserGender,
} from '@med-center-crm/types';
import { CommonUserService, UserNotFoundException } from '@med-center-crm/user';
import { ForbiddenException } from '@nestjs/common';
import { UserTokenPayload } from '@med-center-crm/auth';
import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';

describe('DoctorService', () => {
  let service: DoctorService;
  let commonUserService: jest.Mocked<CommonUserService>;
  let doctorDetailsRepository: jest.Mocked<Repository<DoctorDetails>>;

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
                  save: jest.fn(),
                })
              ),
            },
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue(null),
            }),
          },
        },
        {
          provide: getRepositoryToken(DoctorDetails),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<DoctorService>(DoctorService);
    commonUserService = module.get(CommonUserService);
    doctorDetailsRepository = module.get(getRepositoryToken(DoctorDetails));
  });

  describe('createDoctor', () => {
    it('should create user and doctor details inside transaction', async () => {
      const dto: CreateDoctorDto = {
        email: 'doc@mail.com',
        password: '1234',
        full_name: 'Jane Doe',
        gender: UserGender.Male,
        contact: { phone: '', address: '', details: '' },
        details: {
          specialty: 'Cardiology',
          license_number: 'MD123456',
          education: 'Harvard',
          career_summary: '',
          availability: {},
        },
      };

      const expectedUser = { user_id: 42 } as Users;

      commonUserService.createUser.mockResolvedValue(expectedUser);

      const result = await service.createDoctor(dto);

      expect(commonUserService.createUser).toHaveBeenCalledWith(
        expect.anything(),
        UserRole.DOCTOR,
        dto
      );
      expect(result).toBe(expectedUser);
    });
  });

  describe('updateDoctorGeneral', () => {
    it('should allow update if doctor updates their own info', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'doctor@test.com',
        role: UserRole.DOCTOR,
      };

      const dto: UpdateUserGeneralDto = { full_name: 'Updated Name' } as any;

      await service.updateDoctorGeneral(payload, 1, dto);

      expect(commonUserService.updateUserGeneral).toHaveBeenCalledWith(1, dto);
    });

    it('should throw ForbiddenException if doctor updates another user', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'doctor@test.com',
        role: UserRole.DOCTOR,
      };

      const dto: UpdateUserGeneralDto = { full_name: 'Blocked' } as any;

      await expect(
        service.updateDoctorGeneral(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateDoctorContact', () => {
    it('should allow update if doctor updates their own contact info', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'doctor@test.com',
        role: UserRole.DOCTOR,
      };

      const dto: UpdateUserContactDto = { phone: '+123456789' } as any;

      await service.updateDoctorContact(payload, 1, dto);

      expect(commonUserService.updateUserContact).toHaveBeenCalledWith(
        expect.anything(),
        1,
        dto
      );
    });

    it('should throw ForbiddenException if doctor updates another user', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'doctor@test.com',
        role: UserRole.DOCTOR,
      };

      const dto: UpdateUserContactDto = { phone: '+999999999' } as any;

      await expect(
        service.updateDoctorContact(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateDoctorDetails', () => {
    it('should update doctor details if access is valid', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'doctor@test.com',
        role: UserRole.DOCTOR,
      };

      const dto: UpdateDoctorDetailsDto = {
        specialty: 'Neurology',
        education: 'Oxford',
      };

      doctorDetailsRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateDoctorDetails(payload, 1, dto);

      expect(doctorDetailsRepository.update).toHaveBeenCalledWith(
        { user_id: 1 },
        dto
      );
    });

    it('should throw if doctor details not found', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'doctor@test.com',
        role: UserRole.DOCTOR,
      };

      const dto: UpdateDoctorDetailsDto = { specialty: 'Neurology' };

      doctorDetailsRepository.update.mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.updateDoctorDetails(payload, 1, dto)
      ).rejects.toThrow(UserNotFoundException);
    });

    it("should throw ForbiddenException if doctor updates another doctor's details", async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'doctor@test.com',
        role: UserRole.DOCTOR,
      };

      const dto: UpdateDoctorDetailsDto = { specialty: 'Forbidden' };

      await expect(
        service.updateDoctorDetails(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
