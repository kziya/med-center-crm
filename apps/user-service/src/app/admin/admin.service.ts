import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
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
    if (tokenPayload.role === UserRole.ADMIN && tokenPayload.id !== id) {
      throw new ForbiddenException();
    }

    return this.userRepository.findOne({
      where: { user_id: id, role: UserRole.ADMIN },
      relations: ['contact'],
    });
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<Users> {
    return this.userRepository.manager.transaction((transactionManager) =>
      this.commonUserService.createUser(transactionManager, createUserDto)
    );
  }

  async updateAdminGeneral(
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

  async updateAdminContact(
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
      userTokenPayload.role === UserRole.ADMIN &&
      userTokenPayload.id !== id
    ) {
      throw new ForbiddenException();
    }
  }
}
