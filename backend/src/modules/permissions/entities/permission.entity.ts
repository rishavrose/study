import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Permission name', example: 'user:create' })
  @Column({ unique: true, length: 100 })
  name: string;

  @ApiProperty({ description: 'Permission display name', example: 'Create User' })
  @Column({ length: 100 })
  displayName: string;

  @ApiProperty({ description: 'Permission description', example: 'Allows creating new users' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Permission category', example: 'user-management' })
  @Column({ length: 50, nullable: true })
  category: string;

  @ApiProperty({ description: 'Permission active status', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Roles that have this permission', type: () => [Role] })
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @ApiProperty({ description: 'Menus that require this permission', type: () => ['Menu'] })
  @ManyToMany('Menu', 'permissions')
  menus: any[];

  @ApiProperty({ description: 'Permission creation date', type: Date })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Permission last update date', type: Date })
  @UpdateDateColumn()
  updatedAt: Date;
}
