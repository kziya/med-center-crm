import { Controller, Get, Query } from '@nestjs/common';

import { GetActivityLogListDto, UserRole } from '@med-center-crm/types';
import { Roles } from '@med-center-crm/auth';
import { ActivityService } from './activity.service';

@Roles(UserRole.SUPER_ADMIN)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('list')
  async getActivityList(@Query() getActivityLogDto: GetActivityLogListDto) {
    return this.activityService.getActivityLogList(getActivityLogDto);
  }
}
