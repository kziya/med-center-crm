import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ActivityActionType,
  ActivityEntityType,
  ActivityLogEvent,
  AppointmentDetails,
  Appointments,
  AppointmentStatus,
  CreateAppointmentDto,
  DoctorPatientAssignment,
  FullAppointmentDto,
  GetAppointmentListDto,
  UpdateAppointmentDetailsDto,
  UpdateAppointmentGeneralDto,
  UpdateAppointmentStatusDto,
  UserRole,
} from '@med-center-crm/types';
import { UserTokenPayload } from '@med-center-crm/auth';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AsyncLocalStorageService } from '@med-center-crm/async-local-storage';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointments)
    private readonly appointmentRepository: Repository<Appointments>,
    @InjectRepository(AppointmentDetails)
    private readonly appointmentDetailsRepository: Repository<AppointmentDetails>,
    @InjectQueue(ActivityLogEvent.queue)
    private readonly activityLogEventQueue: Queue<ActivityLogEvent>,
    private readonly asyncLocalStorageService: AsyncLocalStorageService
  ) {}

  async createAppointment(
    tokenPayload: UserTokenPayload,
    createAppointmentDto: CreateAppointmentDto
  ): Promise<Appointments> {
    this.validateAccess(tokenPayload, createAppointmentDto.patient_id);
    const createResult = await this.appointmentRepository.manager.transaction(
      async (transactionManager) => {
        const appointment = await transactionManager.save(Appointments, {
          patient_id: createAppointmentDto.patient_id,
          doctor_id: createAppointmentDto.doctor_id,
          patient_notes: createAppointmentDto.patient_notes,
          appointment_time: createAppointmentDto.appointment_time,
          status: AppointmentStatus.PENDING,
        });

        await transactionManager.insert(AppointmentDetails, {
          appointment_id: appointment.appointment_id,
        });

        await transactionManager
          .createQueryBuilder()
          .insert()
          .into(DoctorPatientAssignment)
          .values({
            doctor_id: createAppointmentDto.doctor_id,
            patient_id: createAppointmentDto.patient_id,
          })
          .orIgnore()
          .execute();

        return appointment;
      }
    );

    const { ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.CREATE,
      entity_id: createResult.appointment_id,
      entity_type: ActivityEntityType.APPOINTMENT,
      ip_address: ipAddress,
      user_id: tokenPayload.id,
      metadata: {
        newData: createAppointmentDto,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);

    return createResult;
  }

  async getAppointmentList(
    tokenPayload: UserTokenPayload,
    getAppointmentListDto: GetAppointmentListDto
  ): Promise<Appointments[]> {
    this.validateAccess(
      tokenPayload,
      tokenPayload.role === UserRole.DOCTOR
        ? getAppointmentListDto.doctor_id
        : getAppointmentListDto.patient_id
    );

    const query = this.appointmentRepository
      .createQueryBuilder('a')
      .select(
        'a.appointment_id, a.doctor_id, a.patient_id, a.appointment_time, a.status, a.patient_notes'
      );

    if (getAppointmentListDto.doctor_id) {
      query.where('doctor_id=:doctor_id', {
        doctor_id: getAppointmentListDto.doctor_id,
      });
    }

    if (getAppointmentListDto.patient_id) {
      query.where('patient_id =:patient_id', {
        patient_id: getAppointmentListDto.patient_id,
      });
    }

    if (getAppointmentListDto.status) {
      query.where('status=:status', {
        status: getAppointmentListDto.status,
      });
    }

    if (getAppointmentListDto.last_appointment_id) {
      query.where('appointment_id < :last_appointment_id', {
        last_appointment_id: getAppointmentListDto.last_appointment_id,
      });
    }

    return query
      .orderBy('a.appointment_id', 'DESC')
      .limit(getAppointmentListDto.limit ?? 25)
      .getRawMany();
  }

  async getAppointmentById(
    tokenPayload: UserTokenPayload,
    appointment_id: number
  ): Promise<FullAppointmentDto> {
    const patientFilter =
      tokenPayload.role === UserRole.PATIENT
        ? {
            patient_id: tokenPayload.id,
          }
        : {};
    const doctorFilter =
      tokenPayload.role === UserRole.DOCTOR
        ? {
            doctor_id: tokenPayload.id,
          }
        : {};

    const appointment = await this.appointmentRepository.findOne({
      where: {
        appointment_id,
        ...doctorFilter,
        ...patientFilter,
      },
      relations: ['details'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async updateAppointmentGeneral(
    tokenPayload: UserTokenPayload,
    appointmentId: number,
    updateAppointmentGeneralDto: UpdateAppointmentGeneralDto
  ): Promise<void> {
    const patientFilter =
      tokenPayload.role === UserRole.PATIENT
        ? { patient_id: tokenPayload.id }
        : {};

    const result = await this.appointmentRepository.update(
      {
        appointment_id: appointmentId,
        ...patientFilter,
      },
      updateAppointmentGeneralDto
    );

    if (result.affected === 0) {
      throw new NotFoundException('Appointment not found or access denied');
    }

    const { ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.UPDATE,
      entity_id: appointmentId,
      entity_type: ActivityEntityType.APPOINTMENT,
      ip_address: ipAddress,
      user_id: tokenPayload.id,
      metadata: {
        newData: updateAppointmentGeneralDto,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);
  }

  async updateAppointmentStatus(
    tokenPayload: UserTokenPayload,
    appointmentId: number,
    updateAppointmentStatusDto: UpdateAppointmentStatusDto
  ): Promise<void> {
    const doctorFilter =
      tokenPayload.role === UserRole.DOCTOR
        ? { doctor_id: tokenPayload.id }
        : {};

    const result = await this.appointmentRepository.update(
      {
        appointment_id: appointmentId,
        ...doctorFilter,
      },
      updateAppointmentStatusDto
    );

    if (result.affected === 0) {
      throw new NotFoundException('Appointment not found or access denied');
    }

    const { ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.UPDATE,
      entity_id: appointmentId,
      entity_type: ActivityEntityType.APPOINTMENT,
      ip_address: ipAddress,
      user_id: tokenPayload.id,
      metadata: {
        newData: updateAppointmentStatusDto,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);
  }

  async updateAppointmentDetails(
    tokenPayload: UserTokenPayload,
    appointmentId: number,
    updateAppointmentDetailsDto: UpdateAppointmentDetailsDto
  ): Promise<void> {
    const queryBuilder = this.appointmentDetailsRepository
      .createQueryBuilder()
      .update()
      .set(updateAppointmentDetailsDto)
      .where('appointment_id = :appointmentId', { appointmentId });

    if (tokenPayload.role === UserRole.DOCTOR) {
      queryBuilder.andWhere(
        `EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.appointment_id = appointment_details.appointment_id
        AND a.doctor_id = :doctorId
      )`,
        { doctorId: tokenPayload.id }
      );
    }

    const result = await queryBuilder.execute();

    if (result.affected === 0) {
      throw new NotFoundException('Appointment not found or access denied');
    }

    const { ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.UPDATE,
      entity_id: appointmentId,
      entity_type: ActivityEntityType.APPOINTMENT,
      ip_address: ipAddress,
      user_id: tokenPayload.id,
      metadata: {
        newData: updateAppointmentDetailsDto,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);
  }

  private validateAccess(tokenPayload: UserTokenPayload, id: number): void {
    if (
      (tokenPayload.role === UserRole.PATIENT ||
        tokenPayload.role === UserRole.DOCTOR) &&
      tokenPayload.id !== id
    ) {
      throw new ForbiddenException();
    }
  }
}
