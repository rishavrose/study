import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    try {
      const menu = new Menu();
      Object.assign(menu, createMenuDto);

      // Handle parent relationship
      if (createMenuDto.parent_id) {
        const parent = await this.menuRepository.findOne({
          where: { id: createMenuDto.parent_id },
        });
        if (!parent) {
          throw new NotFoundException(`Parent menu with ID ${createMenuDto.parent_id} not found`);
        }
        menu.parent = parent;
      }

      // Handle roles
      if (createMenuDto.roleIds && createMenuDto.roleIds.length > 0) {
        const roles = await this.roleRepository.findByIds(createMenuDto.roleIds);
        if (roles.length !== createMenuDto.roleIds.length) {
          throw new BadRequestException('One or more roles not found');
        }
        menu.roles = roles;
      }

      // Handle permissions
      if (createMenuDto.permissionIds && createMenuDto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findByIds(createMenuDto.permissionIds);
        if (permissions.length !== createMenuDto.permissionIds.length) {
          throw new BadRequestException('One or more permissions not found');
        }
        menu.permissions = permissions;
      }

      return await this.menuRepository.save(menu);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Could not create menu');
    }
  }

  async findAll(): Promise<Menu[]> {
    return await this.menuRepository.find({
      relations: ['roles', 'permissions', 'parent', 'children'],
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findAllHierarchical(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      // relations: ['roles', 'permissions', 'children'],
      where: { parent_id: IsNull() },
      order: { order: 'ASC', createdAt: 'ASC' },
    });

    // Load children recursively
    for (const menu of menus) {
      await this.loadChildrenRecursively(menu);
    }

    return menus;
  }

  private async loadChildrenRecursively(menu: Menu): Promise<void> {
    if (menu.children) {
      menu.children.sort((a, b) => a.order - b.order);
      for (const child of menu.children) {
        await this.loadChildrenRecursively(child);
      }
    }
  }

  async findByUserRoleAndPermissions(userRole: string, userPermissions: string[]): Promise<Menu[]> {
    const menus = await this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.roles', 'role')
      .leftJoinAndSelect('menu.permissions', 'permission')
      .leftJoinAndSelect('menu.children', 'children')
      .leftJoinAndSelect('children.roles', 'childRole')
      .leftJoinAndSelect('children.permissions', 'childPermission')
      .where('menu.isActive = :isActive', { isActive: true })
      .andWhere('menu.parent_id IS NULL')
      .orderBy('menu.order', 'ASC')
      .addOrderBy('menu.createdAt', 'ASC')
      .getMany();

    // Filter menus based on user role and permissions
    const filteredMenus = menus.filter(menu => this.hasMenuAccess(menu, userRole, userPermissions));

    // Filter children recursively
    for (const menu of filteredMenus) {
      menu.children = await this.filterChildrenRecursively(menu.children, userRole, userPermissions);
    }

    return filteredMenus;
  }

  private async filterChildrenRecursively(children: Menu[], userRole: string, userPermissions: string[]): Promise<Menu[]> {
    if (!children || children.length === 0) {
      return [];
    }

    const filteredChildren = children.filter(child => this.hasMenuAccess(child, userRole, userPermissions));

    for (const child of filteredChildren) {
      if (child.children) {
        child.children = await this.filterChildrenRecursively(child.children, userRole, userPermissions);
      }
    }

    return filteredChildren;
  }

  private hasMenuAccess(menu: Menu, userRole: string, userPermissions: string[]): boolean {
    // If no roles or permissions are assigned to the menu, it's accessible to all
    if ((!menu.roles || menu.roles.length === 0) && (!menu.permissions || menu.permissions.length === 0)) {
      return true;
    }

    // Check if user has required role
    if (menu.roles && menu.roles.length > 0) {
      const hasRole = menu.roles.some(role => role.name === userRole);
      if (hasRole) {
        return true;
      }
    }

    // Check if user has required permissions
    if (menu.permissions && menu.permissions.length > 0) {
      const hasPermission = menu.permissions.some(permission => 
        userPermissions.includes(permission.name)
      );
      if (hasPermission) {
        return true;
      }
    }

    return false;
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['roles', 'permissions', 'parent', 'children'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);

    Object.assign(menu, updateMenuDto);

    // Handle parent relationship
    if (updateMenuDto.parent_id) {
      const parent = await this.menuRepository.findOne({
        where: { id: updateMenuDto.parent_id },
      });
      if (!parent) {
        throw new NotFoundException(`Parent menu with ID ${updateMenuDto.parent_id} not found`);
      }
      menu.parent = parent;
    } else if (updateMenuDto.parent_id === null) {
      menu.parent_id = null;
    }

    // Handle roles
    if (updateMenuDto.roleIds !== undefined) {
      if (updateMenuDto.roleIds.length > 0) {
        const roles = await this.roleRepository.findByIds(updateMenuDto.roleIds);
        if (roles.length !== updateMenuDto.roleIds.length) {
          throw new BadRequestException('One or more roles not found');
        }
        menu.roles = roles;
      } else {
        menu.roles = [];
      }
    }

    // Handle permissions
    if (updateMenuDto.permissionIds !== undefined) {
      if (updateMenuDto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findByIds(updateMenuDto.permissionIds);
        if (permissions.length !== updateMenuDto.permissionIds.length) {
          throw new BadRequestException('One or more permissions not found');
        }
        menu.permissions = permissions;
      } else {
        menu.permissions = [];
      }
    }

    return await this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }

  async seedDefaultMenus(): Promise<void> {
    const existingMenus = await this.menuRepository.count();
    if (existingMenus > 0) {
      return; // Already seeded
    }

    const defaultMenus = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'IconMenuDashboard',
        order: 1,
        type: 'menu' as const,
        children: [
          { key: 'sales', label: 'Sales', to: '/', order: 1, type: 'submenu' as const },
          { key: 'analytics', label: 'Analytics', to: '/analytics', order: 2, type: 'submenu' as const },
          { key: 'finance', label: 'Finance', to: '/finance', order: 3, type: 'submenu' as const },
          { key: 'crypto', label: 'Crypto', to: '/crypto', order: 4, type: 'submenu' as const },
        ],
      },
      {
        key: 'apps_section',
        label: 'APPS',
        type: 'section' as const,
        order: 2,
      },
      {
        key: 'apps',
        label: 'Apps',
        order: 3,
        type: 'menu' as const,
        children: [
          { key: 'chat', label: 'Chat', to: '/apps/chat', icon: 'IconMenuChat', order: 1, type: 'submenu' as const },
          { key: 'mailbox', label: 'Mailbox', to: '/apps/mailbox', icon: 'IconMenuMailbox', order: 2, type: 'submenu' as const },
          { key: 'todolist', label: 'Todo List', to: '/apps/todolist', icon: 'IconMenuTodo', order: 3, type: 'submenu' as const },
          { key: 'notes', label: 'Notes', to: '/apps/notes', icon: 'IconMenuNotes', order: 4, type: 'submenu' as const },
          { key: 'scrumboard', label: 'Scrumboard', to: '/apps/scrumboard', icon: 'IconMenuScrumboard', order: 5, type: 'submenu' as const },
          { key: 'contacts', label: 'Contacts', to: '/apps/contacts', icon: 'IconMenuContacts', order: 6, type: 'submenu' as const },
          {
            key: 'invoice',
            label: 'Invoice',
            icon: 'IconMenuInvoice',
            order: 7,
            type: 'submenu' as const,
            children: [
              { key: 'invoice_list', label: 'List', to: '/apps/invoice/list', order: 1, type: 'submenu' as const },
              { key: 'invoice_preview', label: 'Preview', to: '/apps/invoice/preview', order: 2, type: 'submenu' as const },
              { key: 'invoice_add', label: 'Add', to: '/apps/invoice/add', order: 3, type: 'submenu' as const },
              { key: 'invoice_edit', label: 'Edit', to: '/apps/invoice/edit', order: 4, type: 'submenu' as const },
            ],
          },
          { key: 'calendar', label: 'Calendar', to: '/apps/calendar', icon: 'IconMenuCalendar', order: 8, type: 'submenu' as const },
        ],
      },
      {
        key: 'user_management',
        label: 'USER MANAGEMENT',
        type: 'section' as const,
        order: 4,
      },
      {
        key: 'users',
        label: 'Users',
        icon: 'IconMenuUsers',
        order: 5,
        type: 'menu' as const,
        children: [
          { key: 'user_profile', label: 'Profile', to: '/users/profile', order: 1, type: 'submenu' as const },
          { key: 'user_settings', label: 'Account Settings', to: '/users/user-account-settings', order: 2, type: 'submenu' as const },
        ],
      },
    ];

    await this.createMenuHierarchy(defaultMenus);
  }

  private async createMenuHierarchy(menuData: any[], parentId: string | null = null): Promise<void> {
    for (const menuItem of menuData) {
      const menu = new Menu();
      menu.key = menuItem.key;
      menu.label = menuItem.label;
      menu.to = menuItem.to;
      menu.icon = menuItem.icon;
      menu.order = menuItem.order;
      menu.type = menuItem.type;
      menu.parent_id = parentId;

      const savedMenu = await this.menuRepository.save(menu);

      if (menuItem.children) {
        await this.createMenuHierarchy(menuItem.children, savedMenu.id);
      }
    }
  }
}
