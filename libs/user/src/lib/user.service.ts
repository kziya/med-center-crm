import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  CreateUserDto,
  GetUserListDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserContacts,
  UserRole,
  Users,
  UserStatus,
} from '@med-center-crm/types';
import { UserNotFoundException } from './exceptions';
import Redis from 'ioredis';

@Injectable()
export class CommonUserService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>
  ) {}

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getUserList(
    role: UserRole,
    getUserListDto: GetUserListDto
  ): Promise<Users[]> {
    const query = this.userRepository
      .createQueryBuilder('u')
      .select('u.user_id, u.gender, u.email, u.full_name, u.role, u.status')
      .where('role = :role', {
        role,
      });

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
      query.andWhere('u.full_name LIKE :searchString', {
        searchString: `%${getUserListDto.searchString}%`,
      });
    }

    const limit = Math.min(getUserListDto.limit || 0, 100);
    return query.orderBy('u.user_id', 'ASC').limit(limit).getRawMany();
  }

  async createUser(
    entityManager: EntityManager,
    role: UserRole,
    createUserDto: CreateUserDto,
    status = UserStatus.ACTIVE
  ): Promise<Users> {
    const user = await entityManager.save(Users, {
      email: createUserDto.email,
      password_hash: await this.hashPassword(createUserDto.password),
      full_name: createUserDto.full_name,
      role: role,
      gender: createUserDto.gender,
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

  async verifyUser(userId: number): Promise<UpdateResult> {
    return this.userRepository.update(
      {
        user_id: userId,
        status: UserStatus.PENDING,
      },
      {
        status: UserStatus.ACTIVE,
      }
    );
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
