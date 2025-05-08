import { Body, Controller, Param, Patch, Post } from '@nestjs/common';

import {
  GetUserTokenPayload,
  Roles,
  UserTokenPayload,
} from '@med-center-crm/auth';
import {
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { DoctorService } from './doctor.service';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  async createDoctor(): Promise<Users> {
    return null;
  }

  @Patch(':id/general')
  @ApiOperation({ summary: 'Update general information of an doctor' })
  @ApiParam({ name: 'id', type: Number, description: 'Doctor user ID' })
  @ApiBody({ type: UpdateUserGeneralDto })
  async updateDoctorGeneral(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateUserGeneralDto: UpdateUserGeneralDto
  ): Promise<void> {
    return this.doctorService.updateDoctorGeneral(
      tokenPayload,
      +id,
      updateUserGeneralDto
    );
  }

  @Patch(':id/contact')
  @ApiOperation({ summary: 'Update contact information of an doctor' })
  @ApiParam({ name: 'id', type: Number, description: 'Doctor user ID' })
  @ApiBody({ type: UpdateUserContactDto })
  async updateDoctorContact(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateUserContactDto: UpdateUserContactDto
  ): Promise<void> {
    return this.doctorService.updateDoctorContact(
      tokenPayload,
      +id,
      updateUserContactDto
    );
  }
}
