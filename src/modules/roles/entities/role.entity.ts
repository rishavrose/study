import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Role name', example: 'admin' })
  @Column({ unique: true, length: 50 })
  name: string;

  @ApiProperty({ description: 'Role display name', example: 'Administrator' })
  @Column({ length: 100 })
  displayName: string;

  @ApiProperty({ description: 'Role description', example: 'Full administrative access' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Role active status', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Role permissions', type: () => [Permission] })
  @ManyToMany(() => Permission, permission => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  @ApiProperty({ description: 'Role creation date', type: Date })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Role last update date', type: Date })
  @UpdateDateColumn()
  updatedAt: Date;
}
