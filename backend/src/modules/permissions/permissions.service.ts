import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission with this name already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name }
    });

    if (existingPermission) {
      throw new ConflictException(`Permission with name '${createPermissionDto.name}' already exists`);
    }

    const permission = this.permissionRepository.create({
      name: createPermissionDto.name,
      displayName: createPermissionDto.displayName,
      description: createPermissionDto.description,
      category: createPermissionDto.category,
      isActive: createPermissionDto.isActive ?? true,
    });

    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      relations: ['roles'],
      order: { category: 'ASC', createdAt: 'DESC' }
    });
  }

  async findByCategory(category: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { category },
      relations: ['roles'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles']
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async findByName(name: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { name },
      relations: ['roles']
    });

    if (!permission) {
      throw new NotFoundException(`Permission with name '${name}' not found`);
    }

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // Check if new name conflicts with existing permissions
    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updatePermissionDto.name }
      });

      if (existingPermission) {
        throw new ConflictException(`Permission with name '${updatePermissionDto.name}' already exists`);
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.category', 'category')
      .where('permission.category IS NOT NULL')
      .getRawMany();

    return result.map(item => item.category);
  }
}
