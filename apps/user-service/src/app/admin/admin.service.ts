import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ActivityLogEvent,
  CreateUserDto,
  GetUserListDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserFullDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { CommonUserService } from '@med-center-crm/user';
import { UserTokenPayload } from '@med-center-crm/auth';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AdminService {
  constructor(
    private readonly commonUserService: CommonUserService,
    @InjectRepository(Users) private readonly userRepository: Repository<Users>
  ) {}

  async getAdminList(getUserListDto: GetUserListDto): Promise<Users[]> {
    return this.commonUserService.getUserList(UserRole.ADMIN, getUserListDto);
  }

  async getAdminById(
    tokenPayload: UserTokenPayload,
    id: number
  ): Promise<UserFullDto> {
    this.validateAccess(tokenPayload, id);

    return this.userRepository.findOne({
      where: { user_id: id, role: UserRole.ADMIN },
      relations: ['contact'],
      select: {
        user_id: true,
        email: true,
        status: true,
        gender: true,
        role: true,
      },
    });
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<Users> {
    return this.userRepository.manager.transaction((transactionManager) =>
      this.commonUserService.createUser(
        transactionManager,
        UserRole.ADMIN,
        createUserDto
      )
    );
  }

  async updateAdminGeneral(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateUserGeneral: UpdateUserGeneralDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);

    return this.commonUserService.updateUserGeneral(id, updateUserGeneral);
  }

  async updateAdminContact(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateUserContact: UpdateUserContactDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);

    return this.commonUserService.updateUserContact(id, updateUserContact);
  }

  private validateAccess(userTokenPayload: UserTokenPayload, id: number): void {
    if (
      userTokenPayload.role === UserRole.ADMIN &&
      userTokenPayload.id !== id
    ) {
      throw new ForbiddenException();
    }
  }
}
