import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreatePatientDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { UserTokenPayload } from '@med-center-crm/auth';
import { CommonUserService } from '@med-center-crm/user';
import { CommonPatientService } from '@med-center-crm/patient';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    private readonly commonUserService: CommonUserService,
    private readonly commonPatientService: CommonPatientService
  ) {}

  createPatient(createPatientService: CreatePatientDto): Promise<Users> {
    return this.commonPatientService.createPatient(createPatientService);
  }

  async updatePatientGeneral(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateUserGeneral: UpdateUserGeneralDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);

    return this.userRepository.manager.transaction((transactionManager) =>
      this.commonUserService.updateUserGeneral(
        transactionManager,
        id,
        updateUserGeneral
      )
    );
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

  private validateAccess(userTokenPayload: UserTokenPayload, id: number): void {
    if (
      userTokenPayload.role === UserRole.PATIENT &&
      userTokenPayload.id !== id
    ) {
      throw new ForbiddenException();
    }
  }
}
