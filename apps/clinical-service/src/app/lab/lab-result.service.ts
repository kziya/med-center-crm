import {
  BadRequestException,
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
  Appointments,
  CreateLabResultDto,
  GetLabResultListDto,
  LabResults,
  UpdateLabResultDto,
  UserRole,
} from '@med-center-crm/types';
import { UserTokenPayload } from '@med-center-crm/auth';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AsyncLocalStorageService } from '@med-center-crm/async-local-storage';

@Injectable()
export class LabResultService {
  constructor(
    @InjectRepository(LabResults)
    private readonly labResultsRepository: Repository<LabResults>,
    @InjectRepository(Appointments)
    private readonly appointmentsRepository: Repository<Appointments>,
    @InjectQueue(ActivityLogEvent.queue)
    private readonly activityLogEventQueue: Queue<ActivityLogEvent>,
    private readonly asyncLocalStorageService: AsyncLocalStorageService
  ) {}

  async getLabResultList(
    tokenPayload: UserTokenPayload,
    patientId: number,
    getLabResultListDto: GetLabResultListDto
  ): Promise<LabResults[]> {
    this.validateAccess(tokenPayload, patientId);

    const query = this.labResultsRepository
      .createQueryBuilder('lr')
      .select('*')
      .where('lr.patient_id = :patientId', { patientId });

    if (getLabResultListDto.lastLabId) {
      query.andWhere('lr.lab_result_id < :lastLabId', {
        lastLabId: getLabResultListDto.lastLabId,
      });
    }

    if (getLabResultListDto.testType) {
      query.andWhere('lr.test_type=:testType', {
        testType: getLabResultListDto.testType,
      });
    }

    if (tokenPayload.role === UserRole.DOCTOR) {
      query.innerJoin(
        'doctor_patient_assignments',
        'assign',
        'assign.patient_id = lr.patient_id AND assign.doctor_id = :doctorId',
        { doctorId: tokenPayload.id }
      );
    }

    return query
      .limit(getLabResultListDto.limit ?? 100)
      .orderBy('lr.lab_result_id', 'DESC')
      .getRawMany();
  }

  async createLabResult(
    tokenPayload: UserTokenPayload,
    createLabResultDto: CreateLabResultDto
  ): Promise<void> {
    this.validateAccess(tokenPayload, createLabResultDto.doctor_id);

    if (createLabResultDto.appointment_id) {
      await this.validateExistsAppointment(
        createLabResultDto.appointment_id,
        createLabResultDto.patient_id,
        createLabResultDto.doctor_id
      );
    } else {
      await this.validateDoctorAccessToPatient(
        createLabResultDto.patient_id,
        createLabResultDto.doctor_id
      );
    }

    const labResult = await this.labResultsRepository.save({
      patient_id: createLabResultDto.patient_id,
      doctor_id: createLabResultDto.doctor_id,
      appointment_id: createLabResultDto.appointment_id,
      test_type: createLabResultDto.test_type,
      test_name: createLabResultDto.test_name,
      result: createLabResultDto.result,
      result_date: createLabResultDto.result_date,
      notes: createLabResultDto.notes,
    });

    const { ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.UPDATE,
      entity_id: labResult.lab_result_id,
      entity_type: ActivityEntityType.LAB_RESULT,
      ip_address: ipAddress,
      user_id: tokenPayload.id,
      metadata: {
        newData: createLabResultDto,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);
  }

  async updateLabResult(
    tokenPayload: UserTokenPayload,
    labResultId: number,
    updateLabResultDto: UpdateLabResultDto
  ): Promise<void> {
    const doctorFilter =
      tokenPayload.role === UserRole.DOCTOR
        ? { doctor_id: tokenPayload.id }
        : {};

    const result = await this.labResultsRepository.update(
      {
        lab_result_id: labResultId,
        ...doctorFilter,
      },
      updateLabResultDto
    );

    if (result.affected === 0) {
      throw new NotFoundException('Lab result not found or access denied');
    }

    const { ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.CREATE,
      entity_id: labResultId,
      entity_type: ActivityEntityType.LAB_RESULT,
      ip_address: ipAddress,
      user_id: tokenPayload.id,
      metadata: {
        newData: updateLabResultDto,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);
  }

  private async validateExistsAppointment(
    appointmentId: number,
    patientId: number,
    doctorId: number
  ): Promise<void> {
    const isExists = await this.appointmentsRepository.findOne({
      where: {
        appointment_id: appointmentId,
        doctor_id: doctorId,
        patient_id: patientId,
      },
    });

    if (!isExists) {
      throw new BadRequestException('Appointment does not exist');
    }
  }

  private async validateDoctorAccessToPatient(
    patientId: number,
    doctorId: number
  ): Promise<void> {
    const isExists = await this.appointmentsRepository.findOne({
      where: {
        doctor_id: doctorId,
        patient_id: patientId,
      },
    });

    if (!isExists) {
      throw new ForbiddenException();
    }
  }

  private validateAccess(
    tokenPayload: UserTokenPayload,
    patientId: number
  ): void {
    if (
      tokenPayload.id !== patientId &&
      tokenPayload.role === UserRole.PATIENT
    ) {
      throw new ForbiddenException();
    }
  }
}
