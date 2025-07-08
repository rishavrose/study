import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  to: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'enum', enum: ['menu', 'submenu', 'section'], default: 'menu' })
  type: 'menu' | 'submenu' | 'section';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isExternal: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  target: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  // Parent-child relationship for nested menus
  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @Column({ type: 'varchar', length: 36, nullable: true })
  parent_id: string | null;

  // Many-to-many relationship with roles
  @ManyToMany(() => Role, (role) => role.menus)
  @JoinTable({
    name: 'menu_roles',
    joinColumn: { name: 'menu_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  // Many-to-many relationship with permissions
  @ManyToMany(() => Permission, (permission) => permission.menus)
  @JoinTable({
    name: 'menu_permissions',
    joinColumn: { name: 'menu_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
