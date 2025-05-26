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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  GetUserTokenPayload,
  Roles,
  UserTokenPayload,
} from '@med-center-crm/auth';
import {
  CreateUserDto,
  GetUserListDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserFullDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Get('list')
  @ApiOperation({ summary: 'Get list of users with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully',
    type: [Users],
  })
  async getAdminList(
    @Query() getUserListDto: GetUserListDto
  ): Promise<Users[]> {
    return this.adminService.getAdminList(getUserListDto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateUserDto })
  async createAdmin(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.adminService.createAdmin(createUserDto);
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

  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get admin user by ID' })
  @ApiParam({
    name: 'id',
    description: 'Admin user ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Admin user found successfully',
    type: UserFullDto,
  })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  getAdmin(
    @GetUserTokenPayload() payload: UserTokenPayload,
    @Param('id') id: string
  ): Promise<UserFullDto> {
    return this.adminService.getAdminById(payload, +id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin by ID (only for SUPER_ADMIN)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the admin to delete',
  })
  @ApiResponse({ status: 200, description: 'Admin successfully deleted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only SUPER_ADMIN has access.',
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async deleteAdmin(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteAdmin(+id);
  }
}
