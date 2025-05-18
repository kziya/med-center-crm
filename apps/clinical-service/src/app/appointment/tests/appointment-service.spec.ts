import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import {
  Appointments,
  AppointmentDetails,
  AppointmentStatus,
  UserRole,
} from '@med-center-crm/types';
import { AppointmentService } from '../appointment.service';
import { UserTokenPayload } from '@med-center-crm/auth';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let appointmentRepo: jest.Mocked<Repository<Appointments>>;
  let detailsRepo: jest.Mocked<Repository<AppointmentDetails>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointments),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            manager: {
              transaction: jest.fn(),
              save: jest.fn(),
              insert: jest.fn(),
              createQueryBuilder: jest.fn(() => ({
                insert: jest.fn().mockReturnThis(),
                into: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnThis(),
                orIgnore: jest.fn().mockReturnThis(),
                execute: jest.fn(),
              })),
            },
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AppointmentDetails),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    appointmentRepo = module.get(getRepositoryToken(Appointments));
    detailsRepo = module.get(getRepositoryToken(AppointmentDetails));
  });

  describe('getAppointmentById', () => {
    it('should return appointment if found', async () => {
      const mockAppointment = { appointment_id: 1, details: {} } as any;
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);

      const result = await service.getAppointmentById(
        { id: 1, role: UserRole.PATIENT } as UserTokenPayload,
        1
      );

      expect(result).toBe(mockAppointment);
    });

    it('should throw if not found', async () => {
      appointmentRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getAppointmentById(
          { id: 1, role: UserRole.PATIENT } as UserTokenPayload,
          1
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAppointmentGeneral', () => {
    it('should succeed when record is updated', async () => {
      appointmentRepo.update.mockResolvedValue({ affected: 1 } as any);

      await expect(
        service.updateAppointmentGeneral(
          { id: 1, role: UserRole.PATIENT } as UserTokenPayload,
          1,
          {
            patient_notes: 'Updated',
          }
        )
      ).resolves.toBeUndefined();
    });

    it('should throw when no record is updated', async () => {
      appointmentRepo.update.mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.updateAppointmentGeneral(
          { id: 1, role: UserRole.PATIENT } as UserTokenPayload,
          1,
          {
            patient_notes: 'None',
          }
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status', async () => {
      appointmentRepo.update.mockResolvedValue({ affected: 1 } as any);

      await expect(
        service.updateAppointmentStatus(
          { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
          1,
          {
            status: AppointmentStatus.COMPLETED,
          }
        )
      ).resolves.toBeUndefined();
    });

    it('should throw if status update fails', async () => {
      appointmentRepo.update.mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.updateAppointmentStatus(
          { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
          1,
          {
            status: AppointmentStatus.CANCELLED,
          }
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAppointmentDetails', () => {
    it('should update if record exists', async () => {
      const mockExecute = jest.fn().mockResolvedValue({ affected: 1 });
      const builder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: mockExecute,
      };
      (detailsRepo.createQueryBuilder as jest.Mock).mockReturnValue(builder);

      await expect(
        service.updateAppointmentDetails(
          { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
          1,
          {
            diagnosis: 'OK',
          }
        )
      ).resolves.toBeUndefined();
    });

    it('should throw if nothing updated', async () => {
      const mockExecute = jest.fn().mockResolvedValue({ affected: 0 });
      const builder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: mockExecute,
      };
      (detailsRepo.createQueryBuilder as jest.Mock).mockReturnValue(builder);

      await expect(
        service.updateAppointmentDetails(
          { id: 1, role: UserRole.DOCTOR } as UserTokenPayload,
          1,
          {
            diagnosis: 'fail',
          }
        )
      ).rejects.toThrow(NotFoundException);
    });
  });
});
