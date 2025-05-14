import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import {
  CreatePatientDto,
  GetUserListDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import {
  GetUserTokenPayload,
  Roles,
  UserTokenPayload,
} from '@med-center-crm/auth';
import { PatientService } from './patient.service';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT)
  @Get('list')
  @ApiOperation({ summary: 'Get list of users with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully',
    type: [Users],
  })
  async getAdminList(
    @GetUserTokenPayload() payload: UserTokenPayload,
    @Query() getUserListDto: GetUserListDto
  ): Promise<Users[]> {
    if (payload.role === UserRole.DOCTOR) {
      return this.patientService.getPatientListForDoctor(
        payload,
        getUserListDto
      );
    }

    return this.patientService.getPatientList(getUserListDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new patient user' })
  @ApiBody({ type: CreatePatientDto })
  async createPatient(
    @Body() createPatientDto: CreatePatientDto
  ): Promise<Users> {
    return this.patientService.createPatient(createPatientDto);
  }

  @Patch(':id/general')
  @ApiOperation({ summary: 'Update general information of an patient' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient user ID' })
  @ApiBody({ type: UpdateUserGeneralDto })
  async updatePatientGeneral(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateUserGeneralDto: UpdateUserGeneralDto
  ): Promise<void> {
    return this.patientService.updatePatientGeneral(
      tokenPayload,
      +id,
      updateUserGeneralDto
    );
  }

  @Patch(':id/contact')
  @ApiOperation({ summary: 'Update contact information of an patient' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient user ID' })
  @ApiBody({ type: UpdateUserContactDto })
  async updatePatientContact(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateUserContactDto: UpdateUserContactDto
  ): Promise<void> {
    return this.patientService.updatePatientContact(
      tokenPayload,
      +id,
      updateUserContactDto
    );
  }
}
