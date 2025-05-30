import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  GetUserTokenPayload,
  Roles,
  UserTokenPayload,
} from '@med-center-crm/auth';
import {
  CreateDoctorDto,
  CreatePatientDto,
  DoctorFullDto,
  GetUserListDto,
  UpdateDoctorDetailsDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserFullDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { DoctorService } from './doctor.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('list')
  @ApiOperation({ summary: 'Get list of users with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully',
    type: [Users],
  })
  async getDoctorList(
    @Query() getUserListDto: GetUserListDto
  ): Promise<Users[]> {
    return this.doctorService.getDoctorList(getUserListDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new doctor user' })
  @ApiBody({ type: CreatePatientDto })
  async createDoctor(@Body() createDoctorDto: CreateDoctorDto): Promise<void> {
    await this.doctorService.createDoctor(createDoctorDto);
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

  @Patch(':id/detail')
  @ApiOperation({ summary: 'Update details of an doctor' })
  @ApiParam({ name: 'id', type: Number, description: 'Doctor user ID' })
  @ApiBody({ type: UpdateDoctorDetailsDto })
  async updateDoctorDetails(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateDoctorDetailsDto: UpdateDoctorDetailsDto
  ): Promise<void> {
    return this.doctorService.updateDoctorDetails(
      tokenPayload,
      +id,
      updateDoctorDetailsDto
    );
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @Get(':id')
  @ApiOperation({ summary: 'Get Doctor user by ID' })
  @ApiParam({
    name: 'id',
    description: 'Doctor user ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor user found successfully',
    type: UserFullDto,
  })
  @ApiResponse({ status: 404, description: 'Doctor user not found' })
  getDoctor(
    @GetUserTokenPayload() payload: UserTokenPayload,
    @Param('id') id: string
  ): Promise<DoctorFullDto> {
    return this.doctorService.getDoctorById(payload, +id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a doctor by ID (only for admins)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the doctor to delete',
  })
  @ApiResponse({ status: 200, description: 'Doctor successfully deleted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async deleteDoctor(@Param('id') id: string): Promise<void> {
    await this.doctorService.deleteDoctor(+id);
  }
}
