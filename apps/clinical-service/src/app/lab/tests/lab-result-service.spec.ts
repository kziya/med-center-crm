import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import {
  Appointments,
  LabResults,
  CreateLabResultDto,
  UserRole,
} from '@med-center-crm/types';
import { LabResultService } from '../lab-result.service';
import { UserTokenPayload } from '@med-center-crm/auth';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LabResultService', () => {
  let service: LabResultService;
  let labRepo: jest.Mocked<Repository<LabResults>>;
  let appointmentRepo: jest.Mocked<Repository<Appointments>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabResultService,
        {
          provide: getRepositoryToken(LabResults),
          useValue: {
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Appointments),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(LabResultService);
    labRepo = module.get(getRepositoryToken(LabResults));
    appointmentRepo = module.get(getRepositoryToken(Appointments));
  });

  describe('createLabResult', () => {
    it('should save lab result when appointment exists', async () => {
      const dto: CreateLabResultDto = {
        patient_id: 1,
        doctor_id: 2,
        appointment_id: 99,
        test_type: 'Blood',
        test_name: 'Hemoglobin',
        result: '13.5',
        result_date: '2025-06-01T10:00:00Z',
        notes: 'All good',
      };
      (appointmentRepo.findOne as jest.Mock).mockResolvedValue({});

      await service.createLabResult(
        { id: 2, role: UserRole.DOCTOR } as UserTokenPayload,
        dto
      );

      expect(labRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          test_type: 'Blood',
        })
      );
    });

    it('should throw BadRequest if appointment is invalid', async () => {
      const dto = {
        patient_id: 1,
        doctor_id: 2,
        appointment_id: 88,
        test_type: 'MRI',
        test_name: 'Brain Scan',
        result_date: '2025-06-01T10:00:00Z',
        notes: 'Clear',
      } as CreateLabResultDto;

      (appointmentRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createLabResult(
          { id: 2, role: UserRole.DOCTOR } as UserTokenPayload,
          dto
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateLabResult', () => {
    it('should update if record found', async () => {
      labRepo.update.mockResolvedValue({ affected: 1 } as UpdateResult);

      await expect(
        service.updateLabResult(
          { id: 2, role: UserRole.DOCTOR } as UserTokenPayload,
          1,
          {
            result: 'Updated',
          }
        )
      ).resolves.toBeUndefined();
    });

    it('should throw NotFound if no update affected', async () => {
      labRepo.update.mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(
        service.updateLabResult(
          { id: 2, role: UserRole.DOCTOR } as UserTokenPayload,
          1,
          {
            result: 'Updated',
          }
        )
      ).rejects.toThrow(NotFoundException);
    });
  });
});
