import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

import {
  GetUserTokenPayload,
  Roles,
  UserTokenPayload,
} from '@med-center-crm/auth';
import {
  CreateUserDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { AdminService } from './admin.service';

@ApiTags('Admin Management')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateUserDto })
  async createAdmin(@Body() createUserDto: CreateUserDto): Promise<Users> {
    return this.adminService.createAdmin(createUserDto);
  }

  @Patch(':id/general')
  @ApiOperation({ summary: 'Update general information of an admin' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin user ID' })
  @ApiBody({ type: UpdateUserGeneralDto })
  async updateAdminGeneral(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateUserGeneralDto: UpdateUserGeneralDto
  ): Promise<void> {
    return this.adminService.updateAdminGeneral(
      tokenPayload,
      +id,
      updateUserGeneralDto
    );
  }

  @Patch(':id/contact')
  @ApiOperation({ summary: 'Update contact information of an admin' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin user ID' })
  @ApiBody({ type: UpdateUserContactDto })
  async updateAdminContact(
    @GetUserTokenPayload() tokenPayload: UserTokenPayload,
    @Param('id') id: string,
    @Body() updateUserContactDto: UpdateUserContactDto
  ): Promise<void> {
    return this.adminService.updateAdminContact(
      tokenPayload,
      +id,
      updateUserContactDto
    );
  }
}
