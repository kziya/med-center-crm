import { ApiProperty } from '@nestjs/swagger';
import { UserFullDto } from '../../user';

export class PatientDetailsDto {
  @ApiProperty({ type: String, required: false, example: '1990-05-10' })
  dob?: Date;

  @ApiProperty({ required: false, example: 'BlueCross Health Insurance' })
  insurance_provider?: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['Peanuts', 'Penicillin'],
  })
  allergies?: string[];

  @ApiProperty({ type: String })
  created_at: Date;

  @ApiProperty({ type: String })
  updated_at: Date;
}

export class PatientFullDto extends UserFullDto {
  @ApiProperty({ type: () => PatientDetailsDto })
  patientDetails: PatientDetailsDto;
}
