import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommonUserService } from '@med-center-crm/user';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { Repository } from 'typeorm';
import { UserTokenPayload } from '@med-center-crm/auth';

@Injectable()
export class DoctorService {
  constructor(
    private readonly commonUserService: CommonUserService,
    @InjectRepository(Users) private readonly userRepository: Repository<Users>
  ) {}

  async createDoctor(createUserDto: CreateUserDto): Promise<Users> {
    return this.userRepository.manager.transaction((transactionManager) =>
      this.commonUserService.createUser(transactionManager, createUserDto)
    );
  }

  async updateDoctorGeneral(
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

  async updateDoctorContact(
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
      userTokenPayload.role === UserRole.DOCTOR &&
      userTokenPayload.id !== id
    ) {
      throw new ForbiddenException();
    }
  }
}
