import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { Permission } from '../../../common/enums/permission.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MaxLength(100, { message: 'First name must be less than 100 characters' })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(100, { message: 'Last name must be less than 100 characters' })
  lastName: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'StrongPassword123!',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: Role,
    example: Role.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: Role;

  @ApiProperty({
    description: 'User permissions',
    enum: Permission,
    example: [Permission.USER_READ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Permission, { each: true, message: 'Invalid permission' })
  permissions?: Permission[];

  @ApiProperty({
    description: 'User active status',
    example: true,
    required: false,
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'User account status',
    example: 'verified',
    required: false,
  }) 
  @IsOptional()
  @IsString()
  accountStatus?: string;

  @ApiProperty({
    description: 'User profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Profile picture URL must be a string' })
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: true,
    type: String,
    minLength: 10,
    maxLength: 15,
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @MinLength(10, { message: 'Phone number must be at least 10 digits long' })
  @MaxLength(15, { message: 'Phone number must be less than 15 digits long' })
  phoneNumber: string; 
 
}

