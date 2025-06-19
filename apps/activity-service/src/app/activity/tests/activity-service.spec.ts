import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService } from '../activity.service';
import {
  ActivityEntityType,
  ActivityLogEvent,
  ActivityLogs,
} from '@med-center-crm/types';

describe('ActivityService', () => {
  let service: ActivityService;
  let repo: jest.Mocked<Repository<ActivityLogs>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(ActivityLogs),
          useValue: {
            createQueryBuilder: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    repo = module.get(getRepositoryToken(ActivityLogs));
  });

  describe('getActivityLogList', () => {
    it('should build query with filters and return logs', async () => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(['log1', 'log2']),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await service.getActivityLogList({
        user_id: 1,
        entity_type: ActivityEntityType.USER,
        limit: 2,
      });

      expect(result).toEqual(['log1', 'log2']);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'log.user_id = :user_id',
        { user_id: 1 }
      );
    });
  });

  describe('createActivityLog', () => {
    it('should insert a log record', async () => {
      const mockEvent: ActivityLogEvent = {
        data: {
          user_id: 1,
          entity_id: 10,
          entity_type: 'PATIENT',
          action_type: 'CREATE',
          ip_address: '127.0.0.1',
          metadata: { some: 'info' },
        },
      } as any;

      await service.createActivityLog(mockEvent);

      expect(repo.insert).toHaveBeenCalledWith({
        user_id: 1,
        entity_id: 10,
        entity_type: 'PATIENT',
        action_type: 'CREATE',
        ip_address: '127.0.0.1',
        metadata: { some: 'info' },
      });
    });
  });
});
