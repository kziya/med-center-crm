import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  Appointments,
  CreateAppointmentDto,
  FullAppointmentDto,
  GetAppointmentListDto,
  UpdateAppointmentGeneralDto,
  UserRole,
  UpdateAppointmentStatusDto,
  UpdateAppointmentDetailsDto,
} from '@med-center-crm/types';
import {
  GetUserTokenPayload,
  Roles,
  UserTokenPayload,
} from '@med-center-crm/auth';
import { AppointmentService } from './appointment.service';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT)
  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiBody({ type: CreateAppointmentDto })
  async createAppointment(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Body() createAppointmentDto: CreateAppointmentDto
  ): Promise<void> {
    await this.appointmentService.createAppointment(
      tokenPayload,
      createAppointmentDto
    );
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of appointments with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments successfully returned',
    type: [Appointments],
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getAppointmentList(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Query() getAppointmentListDto: GetAppointmentListDto
  ): Promise<Appointments[]> {
    return this.appointmentService.getAppointmentList(
      tokenPayload,
      getAppointmentListDto
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a specific appointment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Appointment ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment details successfully returned',
    type: FullAppointmentDto,
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getAppointmentById(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string
  ): Promise<FullAppointmentDto> {
    return this.appointmentService.getAppointmentById(tokenPayload, +id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT)
  @Patch(':id/general')
  @ApiOperation({
    summary: 'Update appointment general info (time or patient notes)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Appointment ID' })
  @ApiBody({ type: UpdateAppointmentGeneralDto })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or appointment not found',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async updateAppointmentGeneral(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateAppointmentGeneralDto: UpdateAppointmentGeneralDto
  ): Promise<void> {
    await this.appointmentService.updateAppointmentGeneral(
      tokenPayload,
      +id,
      updateAppointmentGeneralDto
    );
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @Patch(':id/status')
  async updateAppointmentStatus(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateAppointmentStatusDto: UpdateAppointmentStatusDto
  ): Promise<void> {
    await this.appointmentService.updateAppointmentStatus(
      tokenPayload,
      +id,
      updateAppointmentStatusDto
    );
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @Patch(':id/details')
  async updateAppointmentDetails(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateAppointmentDetailsDto: UpdateAppointmentDetailsDto
  ): Promise<void> {
    await this.appointmentService.updateAppointmentDetails(
      tokenPayload,
      +id,
      updateAppointmentDetailsDto
    );
  }
}
