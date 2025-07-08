import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseUUIDPipe,
  Query
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission as PermissionEntity } from './entities/permission.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully.', type: PermissionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 409, description: 'Conflict. Permission with this name already exists.' })
  @Roles(Role.SUPERADMIN)
  @RequirePermissions(Permission.PERMISSION_CREATE, Permission.SUPERADMIN_MANAGE_ALL)
  create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'List of all permissions.', type: [PermissionEntity] })
  @RequirePermissions(Permission.PERMISSION_READ, Permission.SUPERADMIN_MANAGE_ALL)
  findAll(@Query('category') category?: string): Promise<PermissionEntity[]> {
    if (category) {
      return this.permissionsService.findByCategory(category);
    }
    return this.permissionsService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all permission categories' })
  @ApiResponse({ status: 200, description: 'List of all permission categories.', type: [String] })
  @RequirePermissions(Permission.PERMISSION_READ, Permission.SUPERADMIN_MANAGE_ALL)
  getCategories(): Promise<string[]> {
    return this.permissionsService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Permission found.', type: PermissionEntity })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @RequirePermissions(Permission.PERMISSION_READ, Permission.SUPERADMIN_MANAGE_ALL)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PermissionEntity> {
    return this.permissionsService.findOne(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get a permission by name' })
  @ApiParam({ name: 'name', description: 'Permission name' })
  @ApiResponse({ status: 200, description: 'Permission found.', type: PermissionEntity })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @RequirePermissions(Permission.PERMISSION_READ, Permission.SUPERADMIN_MANAGE_ALL)
  findByName(@Param('name') name: string): Promise<PermissionEntity> {
    return this.permissionsService.findByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully.', type: PermissionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Permission with this name already exists.' })
  @Roles(Role.SUPERADMIN)
  @RequirePermissions(Permission.PERMISSION_UPDATE, Permission.SUPERADMIN_MANAGE_ALL)
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionEntity> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @Roles(Role.SUPERADMIN)
  @RequirePermissions(Permission.PERMISSION_DELETE, Permission.SUPERADMIN_MANAGE_ALL)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
