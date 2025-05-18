import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { GetUserTokenPayload, UserTokenPayload } from '@med-center-crm/auth';
import {
  CreateLabResultDto,
  GetLabResultListDto,
  LabResults,
  UpdateLabResultDto,
} from '@med-center-crm/types';
import { LabResultService } from './lab-result.service';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('lab/result')
export class LabResultController {
  constructor(private readonly labResultService: LabResultService) {}

  @Get(':idParent/list')
  @ApiOperation({ summary: 'Get lab results for a patient' })
  @ApiParam({ name: 'idParent', description: 'Patient ID', example: 42 })
  async getLabResultList(
    @Param('idParent') id: string,
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Query() getLabResultListDto: GetLabResultListDto
  ): Promise<LabResults[]> {
    return this.labResultService.getLabResultList(
      tokenPayload,
      +id,
      getLabResultListDto
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lab result' })
  @ApiBody({ type: CreateLabResultDto })
  async createLabResult(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Body() createLabResultDto: CreateLabResultDto
  ): Promise<void> {
    return this.labResultService.createLabResult(
      tokenPayload,
      createLabResultDto
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing lab result' })
  @ApiParam({ name: 'id', description: 'Lab result ID', example: 101 })
  @ApiBody({ type: UpdateLabResultDto })
  async updateLabResult(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateLabResultDto: UpdateLabResultDto
  ): Promise<void> {
    await this.labResultService.updateLabResult(
      tokenPayload,
      +id,
      updateLabResultDto
    );
  }
}
