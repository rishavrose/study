import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with this name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name }
    });

    if (existingRole) {
      throw new ConflictException(`Role with name '${createRoleDto.name}' already exists`);
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      displayName: createRoleDto.displayName,
      description: createRoleDto.description,
      isActive: createRoleDto.isActive ?? true,
    });

    // If permission IDs are provided, fetch and assign them
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissionIds)
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }

      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions']
    });

    if (!role) {
      throw new NotFoundException(`Role with name '${name}' not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Check if new name conflicts with existing roles
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name }
      });

      if (existingRole) {
        throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`);
      }
    }

    // Update basic properties
    Object.assign(role, updateRoleDto);

    // If permission IDs are provided, update permissions
    if (updateRoleDto.permissionIds !== undefined) {
      if (updateRoleDto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(updateRoleDto.permissionIds)
        });

        if (permissions.length !== updateRoleDto.permissionIds.length) {
          throw new NotFoundException('One or more permissions not found');
        }

        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findOne(roleId);
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId }
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${permissionId} not found`);
    }

    // Check if permission is already assigned
    const hasPermission = role.permissions.some(p => p.id === permissionId);
    if (!hasPermission) {
      role.permissions.push(permission);
      await this.roleRepository.save(role);
    }

    return role;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findOne(roleId);
    
    role.permissions = role.permissions.filter(p => p.id !== permissionId);
    return this.roleRepository.save(role);
  }
}
