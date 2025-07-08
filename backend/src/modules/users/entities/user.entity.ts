import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; 
import { Role } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @Column({ length: 100 })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @Column({ length: 100 })
  lastName: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.USER })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER
  })
  role: Role;

  @ApiProperty({
    description: 'User permissions',
    type: 'array',
    example: [Permission.USER_READ]
  })
  @Column({
    type: 'simple-array',
    default: '',
  })
  permissions: string[];

  @ApiProperty({ description: 'User active status', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'User account status', example: 'verified' })
  @Column({ default: 'pending' })
  accountStatus: string;

  @ApiProperty({ description: 'Last login date', type: Date, nullable: true })
  @Column({ nullable: true })
  lastLoginAt: Date;

  @ApiProperty({ description: 'Account creation date', type: Date })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Account last update date', type: Date })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'User phone number', example: '1234567890'})
  @Column({ nullable: true, length: 10 })
  phoneNumber: string; 

  @ApiProperty({ description:'Profile picture URL', example: 'https://example.com/profile.jpg'})
  @Column({ nullable: true })
  profilePictureUrl: string;
}

