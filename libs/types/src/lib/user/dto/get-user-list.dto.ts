import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { UserRole } from '../enums'; // Adjust path as needed

export class GetUserListDto {
  @ApiHideProperty()
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Last user ID for pagination (used as a cursor)',
    example: 100,
  })
  @IsOptional()
  @IsInt({ message: 'lastUserId must be an integer' })
  @Min(1, { message: 'lastUserId must be greater than 0' })
  lastUserId?: number;

  @ApiPropertyOptional({
    description: 'Limit the number of users returned',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be greater than 0' })
  limit?: number;
}
