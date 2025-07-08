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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';

@ApiTags('menus')
@ApiBearerAuth()
@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, description: 'Menu created successfully.', type: Menu })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 400, description: 'Bad request. Invalid input data.' })
  @Roles(Role.SUPERADMIN)
  @RequirePermissions(Permission.MENU_CREATE, Permission.SUPERADMIN_MANAGE_ALL)
  create(@Body() createMenuDto: CreateMenuDto): Promise<Menu> {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, description: 'List of all menu items.', type: [Menu] })
  @RequirePermissions(Permission.MENU_READ, Permission.USER_READ)
  findAll(): Promise<Menu[]> {
    return this.menuService.findAll();
  }

  @Get('hierarchical')
  @ApiOperation({ summary: 'Get all menu items in hierarchical structure' })
  @ApiResponse({ status: 200, description: 'Hierarchical menu structure.', type: [Menu] })
  @RequirePermissions(Permission.MENU_READ, Permission.USER_READ)
  findAllHierarchical(): Promise<Menu[]> {
    return this.menuService.findAllHierarchical();
  }

  @Get('user-menus')
  @ApiOperation({ summary: 'Get menu items for current user based on role and permissions' })
  @ApiResponse({ status: 200, description: 'User-specific menu items.', type: [Menu] })
  @RequirePermissions(Permission.USER_READ)
  async getUserMenus(@Request() req): Promise<Menu[]> {
    const userRole = req.user.role;
    const userPermissions = req.user.permissions || [];
    return this.menuService.findByUserRoleAndPermissions(userRole, userPermissions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu UUID' })
  @ApiResponse({ status: 200, description: 'Menu item found.', type: Menu })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  @RequirePermissions(Permission.MENU_READ, Permission.USER_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Menu> {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiParam({ name: 'id', description: 'Menu UUID' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully.', type: Menu })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  @Roles(Role.SUPERADMIN)
  @RequirePermissions(Permission.MENU_UPDATE, Permission.SUPERADMIN_MANAGE_ALL)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMenuDto: UpdateMenuDto): Promise<Menu> {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiParam({ name: 'id', description: 'Menu UUID' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  @Roles(Role.SUPERADMIN)
  @RequirePermissions(Permission.MENU_DELETE, Permission.SUPERADMIN_MANAGE_ALL)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.menuService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default menu items' })
  @ApiResponse({ status: 200, description: 'Default menus seeded successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @Roles(Role.SUPERADMIN)
  @RequirePermissions(Permission.SUPERADMIN_MANAGE_ALL)
  async seedDefaultMenus(): Promise<{ message: string }> {
    await this.menuService.seedDefaultMenus();
    return { message: 'Default menus seeded successfully' };
  }
}
