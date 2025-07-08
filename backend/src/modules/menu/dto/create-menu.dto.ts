import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsArray, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Menu key identifier',
    example: 'dashboard',
  })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Menu label',
    example: 'Dashboard',
  })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Menu route path',
    example: '/dashboard',
    required: false,
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiProperty({
    description: 'Menu icon class or component name',
    example: 'IconMenuDashboard',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Menu order for sorting',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'Menu type',
    enum: ['menu', 'submenu', 'section'],
    example: 'menu',
  })
  @IsEnum(['menu', 'submenu', 'section'])
  type: 'menu' | 'submenu' | 'section';

  @ApiProperty({
    description: 'Is menu active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Is external link',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isExternal?: boolean;

  @ApiProperty({
    description: 'Link target',
    example: '_blank',
    required: false,
  })
  @IsOptional()
  @IsString()
  target?: string;

  @ApiProperty({
    description: 'Menu description',
    example: 'Dashboard overview',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Parent menu ID',
    example: 'uuid-parent-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiProperty({
    description: 'Role IDs that can access this menu',
    example: ['uuid-role-1', 'uuid-role-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiProperty({
    description: 'Permission IDs required to access this menu',
    example: ['uuid-permission-1', 'uuid-permission-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
