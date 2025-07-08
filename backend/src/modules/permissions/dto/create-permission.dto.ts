import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name', example: 'user:create' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Permission display name', example: 'Create User' })
  @IsString()
  displayName: string;

  @ApiProperty({ description: 'Permission description', example: 'Allows creating new users', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Permission category', example: 'user-management', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Permission active status', example: true, default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
