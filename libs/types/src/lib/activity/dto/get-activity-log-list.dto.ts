import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsIP, Min } from 'class-validator';
import { ActivityActionType } from '../activity-action-type.enum';
import { ActivityEntityType } from '../activity-entity-type.enum';

export class GetActivityLogListDto {
  @ApiPropertyOptional({ description: 'User ID to filter by', example: 42 })
  @IsOptional()
  @IsInt({ message: 'user_id must be an integer' })
  @Min(1, { message: 'user_id must be greater than 0' })
  user_id?: number;

  @ApiPropertyOptional({
    description: 'Entity type being logged (e.g., PATIENT, APPOINTMENT)',
    enum: ActivityEntityType,
  })
  @IsOptional()
  @IsEnum(ActivityEntityType, {
    message: 'entity_type must be a valid ActivityEntityType value',
  })
  entity_type?: ActivityEntityType;

  @ApiPropertyOptional({ description: 'ID of the entity', example: 101 })
  @IsOptional()
  @IsInt({ message: 'entity_id must be an integer' })
  @Min(1, { message: 'entity_id must be greater than 0' })
  entity_id?: number;

  @ApiPropertyOptional({
    description: 'Action performed (e.g., CREATE, UPDATE)',
    enum: ActivityActionType,
  })
  @IsOptional()
  @IsEnum(ActivityActionType, {
    message: 'action_type must be a valid ActivityActionType value',
  })
  action_type?: ActivityActionType;

  @ApiPropertyOptional({
    description: 'Filter logs by IP address',
    example: '192.168.0.1',
  })
  @IsOptional()
  @IsIP(undefined, { message: 'ip_address must be a valid IP address' })
  ip_address?: string;

  @ApiPropertyOptional({
    description: 'Last activity_log_id seen, used for pagination',
    example: 150,
  })
  @IsOptional()
  @IsInt({ message: 'id_last must be an integer' })
  @Min(1, { message: 'id_last must be greater than 0' })
  id_last?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of logs to return',
    example: 50,
  })
  @IsOptional()
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number;
}
