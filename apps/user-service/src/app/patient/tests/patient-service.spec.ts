import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from '../patient.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  CreatePatientDto,
  PatientDetails,
  UpdatePatientDetailsDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserGender,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { CommonUserService, UserNotFoundException } from '@med-center-crm/user';
import { CommonPatientService } from '@med-center-crm/patient';
import { ForbiddenException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { UserTokenPayload } from '@med-center-crm/auth';

describe('PatientService', () => {
  let service: PatientService;
  let commonUserService: jest.Mocked<CommonUserService>;
  let commonPatientService: jest.Mocked<CommonPatientService>;
  let patientDetailsRepository: { update: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            manager: {
              transaction: jest.fn().mockImplementation((cb) => cb({})),
            },
          },
        },
        {
          provide: getRepositoryToken(PatientDetails),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<PatientService>(PatientService);
    commonUserService = module.get(CommonUserService);
    commonPatientService = module.get(CommonPatientService);
    patientDetailsRepository = module.get(getRepositoryToken(PatientDetails));
  });

  describe('createPatient', () => {
    it('should delegate to commonPatientService.createPatient', async () => {
      const dto: CreatePatientDto = {
        email: 'john@example.com',
        password: '1234',
        full_name: 'John Doe',
        gender: UserGender.Male,
        contact: { phone: '', address: '', details: '' },
        details: { dob: new Date() },
      };
      const expectedUser = { user_id: 1 } as Users;

      commonPatientService.createPatient.mockResolvedValue(expectedUser);
      const result = await service.createPatient(dto);

      expect(commonPatientService.createPatient).toHaveBeenCalledWith(dto);
      expect(result).toBe(expectedUser);
    });
  });

  describe('updatePatientGeneral', () => {
    it('should allow update if patient updates own info', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'patient@test.com',
        role: UserRole.PATIENT,
      };
      const dto: UpdateUserGeneralDto = { full_name: 'NewName' } as any;

      await service.updatePatientGeneral(payload, 1, dto);

      expect(commonUserService.updateUserGeneral).toHaveBeenCalledWith(1, dto);
    });

    it('should throw ForbiddenException if patient tries to update another user', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'patient@test.com',
        role: UserRole.PATIENT,
      };
      const dto: UpdateUserGeneralDto = { full_name: 'Hacker' } as any;

      await expect(
        service.updatePatientGeneral(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updatePatientContact', () => {
    it('should allow update if patient updates own contact', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'patient@test.com',
        role: UserRole.PATIENT,
      };
      const dto: UpdateUserContactDto = { phone: '+123456789' } as any;

      await service.updatePatientContact(payload, 1, dto);

      expect(commonUserService.updateUserContact).toHaveBeenCalledWith(
        expect.anything(),
        1,
        dto
      );
    });

    it('should throw ForbiddenException if patient tries to update another user', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'patient@test.com',
        role: UserRole.PATIENT,
      };
      const dto: UpdateUserContactDto = { phone: '+999999999' } as any;

      await expect(
        service.updatePatientContact(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updatePatientDetails', () => {
    it('should update patient details if access is valid', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'patient@test.com',
        role: UserRole.PATIENT,
      };
      const dto: UpdatePatientDetailsDto = { insurance_provider: 'Aetna' };

      patientDetailsRepository.update.mockResolvedValue({ affected: 1 });

      await service.updatePatientDetails(payload, 1, dto);

      expect(patientDetailsRepository.update).toHaveBeenCalledWith(
        { user_id: 1 },
        dto
      );
    });

    it('should throw if patient details not found', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'patient@test.com',
        role: UserRole.PATIENT,
      };
      const dto: UpdatePatientDetailsDto = { insurance_provider: 'Aetna' };

      patientDetailsRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.updatePatientDetails(payload, 1, dto)
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should throw ForbiddenException if patient updates another user', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        email: 'patient@test.com',
        role: UserRole.PATIENT,
      };
      const dto: UpdatePatientDetailsDto = { insurance_provider: 'Invalid' };

      await expect(
        service.updatePatientDetails(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
