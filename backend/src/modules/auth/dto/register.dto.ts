import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { Role } from '../../../common/enums/role.enum';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({
    description: 'User role',
    enum: Role,
    default: Role.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  declare role?: Role;
}

