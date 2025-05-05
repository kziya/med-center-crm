import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  CreateUserDto,
  UserContacts,
  Users,
  UserStatus,
} from '@med-center-crm/types';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
    createUserDto: CreateUserDto
  ): Promise<Users> {
    const user = await entityManager.save(Users, {
      email: createUserDto.email,
      password_hash: await this.hashPassword(createUserDto.password),
      full_name: createUserDto.full_name,
      role: createUserDto.role,
      status: UserStatus.PENDING,
    });

    await entityManager.save(UserContacts, {
      user_id: user.user_id,
      address: createUserDto.contact.address,
      details: createUserDto.contact.details,
      phone: createUserDto.contact.phone,
    });

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
