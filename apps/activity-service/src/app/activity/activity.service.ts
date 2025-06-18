import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ActivityLogEvent,
  ActivityLogs,
  GetActivityLogListDto,
} from '@med-center-crm/types';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLogs)
    private readonly activityLogRepository: Repository<ActivityLogs>
  ) {}

  async getActivityLogList(
    getActivityLogListDto: GetActivityLogListDto
  ): Promise<ActivityLogs[]> {
    const {
      user_id,
      entity_type,
      entity_id,
      action_type,
      ip_address,
      id_last,
      limit = 50,
    } = getActivityLogListDto;

    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .select('*');

    if (user_id) {
      query.andWhere('log.user_id = :user_id', { user_id });
    }

    if (entity_type) {
      query.andWhere('log.entity_type = :entity_type', { entity_type });
    }

    if (entity_id) {
      query.andWhere('log.entity_id = :entity_id', { entity_id });
    }

    if (action_type) {
      query.andWhere('log.action_type = :action_type', { action_type });
    }

    if (ip_address) {
      query.andWhere('log.ip_address = :ip_address', { ip_address });
    }

    if (id_last) {
      query.andWhere('log.activity_log_id < :id_last', { id_last });
    }

    return query
      .orderBy('log.activity_log_id', 'DESC')
      .limit(Math.min(limit, 100))
      .execute();
  }

  async createActivityLog(event: ActivityLogEvent): Promise<void> {
    const {
      user_id,
      entity_id,
      entity_type,
      action_type,
      ip_address,
      metadata,
    } = event.data;

    await this.activityLogRepository.insert({
      user_id,
      entity_id,
      entity_type,
      action_type,
      ip_address,
      metadata,
    });
  }
}
