import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  CreateUserDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserContacts,
  Users,
  UserStatus,
} from '@med-center-crm/types';

import { UserNotFoundException } from './exceptions/user-not-found.exception';

@Injectable()
export class CommonUserService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>
  ) {}

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(
    entityManager: EntityManager,
    createUserDto: CreateUserDto,
    status = UserStatus.ACTIVE
  ): Promise<Users> {
    const user = await entityManager.save(Users, {
      email: createUserDto.email,
      password_hash: await this.hashPassword(createUserDto.password),
      full_name: createUserDto.full_name,
      role: createUserDto.role,
      status,
    });

    await entityManager.save(UserContacts, {
      user_id: user.user_id,
      address: createUserDto.contact.address,
      details: createUserDto.contact.details,
      phone: createUserDto.contact.phone,
    });

    return user;
  }

  async updateUserGeneral(
    entityManager: EntityManager,
    id: number,
    updateUserGeneralDto: UpdateUserGeneralDto
  ): Promise<void> {
    const { password, ...rawUpdates } = updateUserGeneralDto;

    const updateProperties: Partial<Users> = { ...rawUpdates };

    if (password) {
      updateProperties.password_hash = await this.hashPassword(password);
    }

    const result = await entityManager.update(
      Users,
      { user_id: id },
      updateProperties
    );

    if (result.affected === 0) {
      throw new UserNotFoundException();
    }
  }

  async updateUserContact(
    entityManager: EntityManager,
    id: number,
    updateUserContactDto: UpdateUserContactDto
  ): Promise<void> {
    const result = await entityManager.update(
      UserContacts,
      { user_id: id },
      updateUserContactDto
    );

    if (result.affected === 0) {
      throw new UserNotFoundException();
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
