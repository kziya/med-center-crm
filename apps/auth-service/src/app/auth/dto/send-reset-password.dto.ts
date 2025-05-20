import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user requesting password reset',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
