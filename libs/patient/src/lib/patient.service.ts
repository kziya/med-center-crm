import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { CommonUserService } from '@med-center-crm/user';
import {
  CreatePatientDto,
  PatientDetails,
  Users,
  UserStatus,
} from '@med-center-crm/types';

@Injectable()
export class CommonPatientService {
  constructor(
    private readonly commonUserService: CommonUserService,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  async createPatient(
    createPatientDto: CreatePatientDto
  ): Promise<Users | null> {
    let user = null;
    await this.entityManager.transaction(async (transactionManager) => {
      user = await this.commonUserService.createUser(
        transactionManager,
        createPatientDto,
        UserStatus.PENDING
      );

      await transactionManager.save(PatientDetails, {
        user_id: user.user_id,
        dob: createPatientDto.details.dob,
        insurance_provider: createPatientDto.details.insurance_provider,
        allergies: createPatientDto.details.allergies,
      });
    });

    return user;
  }
}
