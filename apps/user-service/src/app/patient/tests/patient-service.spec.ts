import { Test, TestingModule } from '@nestjs/testing';

import {
  Users,
  UserRole,
  CreatePatientDto,
  UpdateUserGeneralDto,
  UpdateUserContactDto,
} from '@med-center-crm/types';
import { CommonUserService } from '@med-center-crm/user';
import { CommonPatientService } from '@med-center-crm/patient';
import { ForbiddenException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { PatientService } from '../patient.service';
import { UserTokenPayload } from '@med-center-crm/auth';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PatientService', () => {
  let service: PatientService;
  let commonUserService: jest.Mocked<CommonUserService>;
  let commonPatientService: jest.Mocked<CommonPatientService>;

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
      ],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<PatientService>(PatientService);
    commonUserService = module.get(CommonUserService);
    commonPatientService = module.get(CommonPatientService);
  });

  describe('createPatient', () => {
    it('should delegate to commonPatientService.createPatient', async () => {
      const dto: CreatePatientDto = {
        email: 'john@example.com',
        password: '1234',
        firstName: 'John',
        lastName: 'Doe',
      } as any;
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
        role: UserRole.PATIENT,
      } as any;
      const dto: UpdateUserGeneralDto = { firstName: 'NewName' } as any;

      await service.updatePatientGeneral(payload, 1, dto);

      expect(commonUserService.updateUserGeneral).toHaveBeenCalledWith(
        expect.anything(),
        1,
        dto
      );
    });

    it('should throw ForbiddenException if patient tries to update another user', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        role: UserRole.PATIENT,
      } as any;
      const dto: UpdateUserGeneralDto = { firstName: 'Hacker' } as any;

      await expect(
        service.updatePatientGeneral(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updatePatientContact', () => {
    it('should allow update if patient updates own contact', async () => {
      const payload: UserTokenPayload = {
        id: 1,
        role: UserRole.PATIENT,
      } as any;
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
        role: UserRole.PATIENT,
      } as any;
      const dto: UpdateUserContactDto = { phone: '+999999999' } as any;

      await expect(
        service.updatePatientContact(payload, 2, dto)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
