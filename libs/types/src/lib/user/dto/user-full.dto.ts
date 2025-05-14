import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../enums';

export class UserContactDto {
  @ApiProperty({ example: '380991112233', required: false })
  phone?: string;

  @ApiProperty({ example: '123 Main St, Kyiv', required: false })
  address?: string;

  @ApiProperty({ example: 'Lives in a private house', required: false })
  details?: string;

  @ApiProperty({ type: String })
  created_at: Date;

  @ApiProperty({ type: String })
  updated_at: Date;
}

export class UserFullDto {
  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ type: String })
  created_at: Date;

  @ApiProperty({ type: String })
  updated_at: Date;

  @ApiProperty({ type: () => UserContactDto })
  contact: UserContactDto;
}
