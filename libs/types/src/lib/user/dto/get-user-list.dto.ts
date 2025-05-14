import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { UserGender } from '../enums/user-gender.enum';

export class GetUserListDto {
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

  @ApiPropertyOptional({
    description: 'Filter by gender (MALE, FEMALE, OTHER)',
    enum: UserGender,
    example: UserGender.Male,
  })
  @IsOptional()
  @IsEnum(UserGender, { message: 'gender must be one of MALE, FEMALE, OTHER' })
  gender?: UserGender;

  @ApiPropertyOptional({
    description: 'Search by full name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString({ message: 'searchString must be a string' })
  searchString?: string;
}
