import { UserFullDto } from '../../user';
import { ApiProperty } from '@nestjs/swagger';

export class DoctorDetailsDto {
  @ApiProperty({ example: 'Cardiologist', description: "Doctor's specialty" })
  specialty: string;

  @ApiProperty({
    example: 'LIC123456',
    description: 'License number of the doctor',
    required: false,
  })
  license_number?: string;

  @ApiProperty({
    example: 'Harvard Medical School',
    description: 'Educational background',
    required: false,
  })
  education?: string;

  @ApiProperty({
    example: 'Worked 10 years in general practice',
    description: 'Career summary',
    required: false,
  })
  career_summary?: string;

  @ApiProperty({
    type: Object,
    example: { monday: ['09:00-12:00'], tuesday: ['14:00-17:00'] },
    description: 'Availability schedule as a JSON object',
    required: false,
  })
  availability?: Record<string, any>;
}

export class DoctorFullDto extends UserFullDto {
  @ApiProperty({
    type: DoctorDetailsDto,
    description: 'Detailed doctor-specific information',
  })
  details: DoctorDetailsDto;
}
