import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class GetUserDto {
  @ApiProperty({
    description: 'ID of the user to retrieve',
    example: 123,
  })
  @IsInt({ message: 'userId must be an integer' })
  @Min(1, { message: 'userId must be greater than 0' })
  userId: number;
}
