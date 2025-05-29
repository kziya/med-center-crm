import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { AsyncLocalStorageService } from '@med-center-crm/async-local-storage';
import {
  LabResults,
  Appointments,
  CreateLabResultDto,
  UpdateLabResultDto,
  UserRole,
  ActivityLogEvent,
  UserTokenPayload,
} from '@med-center-crm/types';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { LabResultService } from '../lab-result.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('LabResultService - Detailed Tests', () => {
  let service: LabResultService;
  let labResultsRepo: jest.Mocked<Repository<LabResults>>;
  let appointmentsRepo: jest.Mocked<Repository<Appointments>>;
  let queue: jest.Mocked<Queue>;
  let alsService: jest.Mocked<AsyncLocalStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabResultService,
        {
          provide: getRepositoryToken(LabResults),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([{ test_name: 'CBC' }]),
            })),
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
        {
          provide: AsyncLocalStorageService,
          useValue: {
            getTokenPayloadAndIpAddress: jest.fn(),
          },
        },
        {
          provide: getQueueToken(ActivityLogEvent.queue),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(LabResultService);
    labResultsRepo = module.get(getRepositoryToken(LabResults));
    appointmentsRepo = module.get(getRepositoryToken(Appointments));
    queue = module.get(getQueueToken(ActivityLogEvent.queue));
    alsService = module.get(AsyncLocalStorageService);
  });

  describe('getLabResultList', () => {
    it('allows doctor with correct access', async () => {
      const token = { id: 1, role: UserRole.DOCTOR } as UserTokenPayload;
      const result = await service.getLabResultList(token, 2, {});

      expect(result).toEqual([{ test_name: 'CBC' }]);
      expect(labResultsRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('denies patient accessing other patients data', async () => {
      const token = { id: 3, role: UserRole.PATIENT } as UserTokenPayload;
      await expect(service.getLabResultList(token, 2, {})).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('createLabResult', () => {
    const dto: CreateLabResultDto = {
      patient_id: 2,
      doctor_id: 1,
      appointment_id: 10,
      test_type: 'blood',
      test_name: 'CBC',
      result: 'Positive',
      result_date: new Date().toISOString(),
      notes: '',
    };

    it('creates lab result and logs event', async () => {
      appointmentsRepo.findOne.mockResolvedValueOnce({} as Appointments);
      labResultsRepo.save.mockResolvedValueOnce({ lab_result_id: 100 } as any);
      alsService.getTokenPayloadAndIpAddress.mockResolvedValueOnce({
        ipAddress: '10.0.0.1',
      });

      await service.createLabResult(
        { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
        dto
      );

      expect(appointmentsRepo.findOne).toHaveBeenCalledWith({
        where: {
          appointment_id: dto.appointment_id,
          doctor_id: dto.doctor_id,
          patient_id: dto.patient_id,
        },
      });
      expect(labResultsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          test_type: 'blood',
        })
      );
      expect(queue.add).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(ActivityLogEvent)
      );
    });

    it('throws if appointment does not exist', async () => {
      appointmentsRepo.findOne.mockResolvedValueOnce(null);
      await expect(
        service.createLabResult(
          { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
          dto
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateLabResult', () => {
    const updateDto: UpdateLabResultDto = { result: 'Updated' };

    it('updates lab result and logs event', async () => {
      labResultsRepo.update.mockResolvedValueOnce({ affected: 1 } as any);
      alsService.getTokenPayloadAndIpAddress.mockResolvedValueOnce({
        ipAddress: '10.0.0.2',
      });

      await service.updateLabResult(
        { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
        42,
        updateDto
      );

      expect(labResultsRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ lab_result_id: 42, doctor_id: 1 }),
        updateDto
      );
      expect(queue.add).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(ActivityLogEvent)
      );
    });

    it('throws if update affected 0 rows', async () => {
      labResultsRepo.update.mockResolvedValueOnce({ affected: 0 } as any);
      await expect(
        service.updateLabResult(
          { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
          999,
          updateDto
        )
      ).rejects.toThrow(NotFoundException);
    });
  });
});
