import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'admin' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Role display name', example: 'Administrator' })
  @IsString()
  displayName: string;

  @ApiProperty({ description: 'Role description', example: 'Full administrative access', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Role active status', example: true, default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Permission IDs to assign to this role', 
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
