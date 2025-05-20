import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreatePatientDto,
  DoctorPatientAssignment,
  GetUserListDto,
  PatientDetails,
  PatientFullDto,
  UpdatePatientDetailsDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserContacts,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { UserTokenPayload } from '@med-center-crm/auth';
import { CommonUserService } from '@med-center-crm/user';
import { CommonPatientService } from '@med-center-crm/patient';
import { UserNotFoundException } from '@med-center-crm/user';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    private readonly commonUserService: CommonUserService,
    private readonly commonPatientService: CommonPatientService,
    @InjectRepository(PatientDetails)
    private readonly patientDetailsRepository: Repository<PatientDetails>
  ) {}

  async getPatientById(
    payload: UserTokenPayload,
    id: number
  ): Promise<PatientFullDto> {
    this.validateAccess(payload, id);

    const query = this.userRepository
      .createQueryBuilder('u')
      .leftJoin(UserContacts, 'contact', 'contact.user_id = u.user_id')
      .leftJoin(PatientDetails, 'pd', 'pd.user_id = u.user_id')
      .select([
        'u.user_id AS user_id',
        'u.gender AS gender',
        'u.email AS email',
        'u.full_name AS full_name',
        'u.role AS role',
        'u.status AS status',
        'contact.phone AS contact_phone',
        'contact.address AS contact_address',
        'contact.details AS contact_details',
        'pd.dob AS pd_dob',
        'pd.insurance_provider AS pd_insurance_provider',
        'pd.allergies AS pd_allergies',
        'pd.created_at AS pd_created_at',
        'pd.updated_at AS pd_updated_at',
      ])
      .where('u.user_id = :id', { id })
      .andWhere('u.role = :role', { role: UserRole.PATIENT });

    if (payload.role === UserRole.DOCTOR) {
      query.innerJoin(
        'doctor_patient_assignments',
        'assign',
        'assign.patient_id = u.user_id AND assign.doctor_id = :doctorId',
        { doctorId: payload.id }
      );
    }

    const raw = await query.getRawOne();

    if (!raw) {
      throw new NotFoundException('Patient not found or access denied');
    }

    return {
      user_id: raw.user_id,
      gender: raw.gender,
      email: raw.email,
      full_name: raw.full_name,
      role: raw.role,
      status: raw.status,
      contact: {
        phone: raw.contact_phone,
        address: raw.contact_address,
        details: raw.contact_details,
      },
      patientDetails: {
        dob: raw.pd_dob,
        insurance_provider: raw.pd_insurance_provider,
        allergies: raw.pd_allergies,
        created_at: raw.pd_created_at,
        updated_at: raw.pd_updated_at,
      },
    };
  }

  async getPatientList(getUserListDto: GetUserListDto): Promise<Users[]> {
    return this.commonUserService.getUserList(UserRole.PATIENT, getUserListDto);
  }

  async getPatientListForDoctor(
    tokenPayload: UserTokenPayload,
    getUserListDto: GetUserListDto
  ): Promise<Users[]> {
    const query = this.userRepository
      .createQueryBuilder('u')
      .innerJoin(DoctorPatientAssignment, 'a', 'a.patient_id = u.user_id')
      .where('a.doctor_id = :doctorId', { doctorId: tokenPayload.id })
      .andWhere('u.role = :role', { role: UserRole.PATIENT });

    if (getUserListDto.gender) {
      query.andWhere('u.gender = :gender', {
        gender: getUserListDto.gender,
      });
    }

    if (getUserListDto.lastUserId) {
      query.andWhere('u.user_id > :lastUserId', {
        lastUserId: getUserListDto.lastUserId,
      });
    }

    if (getUserListDto.searchString) {
      query.andWhere('(u.full_name ILIKE :search)', {
        search: `%${getUserListDto.searchString}%`,
      });
    }

    const limit = Math.min(getUserListDto.limit || 20, 100);
    return query.orderBy('u.user_id', 'ASC').limit(limit).getMany();
  }

  createPatient(createPatientService: CreatePatientDto): Promise<Users> {
    return this.commonPatientService.createPatient(createPatientService);
  }

  async updatePatientGeneral(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateUserGeneral: UpdateUserGeneralDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);

    return this.commonUserService.updateUserGeneral(id, updateUserGeneral);
  }

  async updatePatientContact(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateUserContact: UpdateUserContactDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);

    return this.userRepository.manager.transaction((transactionManager) =>
      this.commonUserService.updateUserContact(
        transactionManager,
        id,
        updateUserContact
      )
    );
  }

  async updatePatientDetails(
    userTokenPayload: UserTokenPayload,
    id: number,
    updatePatientDetailsDto: UpdatePatientDetailsDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);
    const result = await this.patientDetailsRepository.update(
      { user_id: id },
      updatePatientDetailsDto
    );

    if (result.affected === 0) {
      throw new UserNotFoundException();
    }

    return;
  }

  private validateAccess(userTokenPayload: UserTokenPayload, id: number): void {
    if (
      userTokenPayload.role === UserRole.PATIENT &&
      userTokenPayload.id !== id
    ) {
      throw new ForbiddenException();
    }
  }
}
