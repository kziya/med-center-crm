import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  ActivityActionType,
  ActivityEntityType,
  ActivityLogEvent,
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
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AsyncLocalStorageService } from '@med-center-crm/async-local-storage';

@Injectable()
export class CommonUserService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(UserContacts)
    private readonly userContactsRepository: Repository<UserContacts>,
    @InjectQueue(ActivityLogEvent.queue)
    private readonly activityLogEventQueue: Queue<ActivityLogEvent>,
    private readonly asyncLocalStorageService: AsyncLocalStorageService
  ) {}

  async findById(id: number): Promise<Users | null> {
    return this.userRepository.findOne({
      where: {
        user_id: id,
      },
    });
  }

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

    const { password, ...restCreateDto } = createUserDto;
    const { tokenPayload, ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.CREATE,
      entity_id: user.user_id,
      entity_type: ActivityEntityType.USER,
      ip_address: ipAddress,
      user_id: tokenPayload.id,
      metadata: {
        newData: restCreateDto,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);

    return user;
  }

  async updateUserGeneral(
    id: number,
    updateUserGeneralDto: UpdateUserGeneralDto
  ): Promise<void> {
    const { password, ...rawUpdates } = updateUserGeneralDto;

    const updateProperties: Partial<Users> = { ...rawUpdates };

    if (password) {
      updateProperties.password_hash = await this.hashPassword(password);
    }

    const result = await this.userRepository.update(
      { user_id: id },
      updateProperties
    );

    if (result.affected === 0) {
      throw new UserNotFoundException();
    }

    const { tokenPayload, ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.UPDATE,
      entity_type: ActivityEntityType.USER,
      entity_id: id,
      user_id: tokenPayload.id,
      ip_address: ipAddress,
      metadata: {
        newData: updateProperties,
      },
    });

    await this.activityLogEventQueue.add(event.name, event);
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
    id: number,
    updateUserContactDto: UpdateUserContactDto
  ): Promise<void> {
    const result = await this.userContactsRepository.update(
      { user_id: id },
      updateUserContactDto
    );

    if (result.affected === 0) {
      throw new UserNotFoundException();
    }

    const { tokenPayload, ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.UPDATE,
      entity_type: ActivityEntityType.USER,
      entity_id: id,
      user_id: tokenPayload.id,
      ip_address: ipAddress,
      metadata: {
        newData: updateUserContactDto,
      },
    });
    console.log('Event', event);

    await this.activityLogEventQueue.add(event.name, event);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete({
      user_id: id,
    });

    const { tokenPayload, ipAddress } =
      await this.asyncLocalStorageService.getTokenPayloadAndIpAddress();

    const event = new ActivityLogEvent({
      action_type: ActivityActionType.DELETE,
      entity_type: ActivityEntityType.USER,
      entity_id: id,
      user_id: tokenPayload.id,
      ip_address: ipAddress,
      metadata: {},
    });

    await this.activityLogEventQueue.add(event.name, event);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
