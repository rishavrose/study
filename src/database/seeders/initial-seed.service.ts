import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service';
import { RolesService } from '../../modules/roles/roles.service';
import { PermissionsService } from '../../modules/permissions/permissions.service';
import { Permission } from '../../common/enums/permission.enum';
import { Role as RoleEnum } from '../../common/enums/role.enum';

@Injectable()
export class InitialSeedService implements OnModuleInit {
  private readonly logger = new Logger(InitialSeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Automatically called when the module is initialized
   */
  async onModuleInit() {
    try {
      // Only seed in development or when explicitly enabled
      const enableSeeding = this.configService.get<string>('ENABLE_SEEDING') === 'true';
      const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';
      
      if (isDevelopment || enableSeeding) {
        await this.seedPermissions();
        await this.seedRoles();
        await this.seedSuperAdmin();
      }
    } catch (error) {
      this.logger.error(`Seeding failed: ${error.message}`);
    }
  }

  /**
   * Seed the database with an initial superadmin user
   */
  async seedSuperAdmin() {
    try {
      const email = this.configService.get<string>('SUPERADMIN_EMAIL') || 'admin@example.com';
      const password = this.configService.get<string>('SUPERADMIN_PASSWORD') || 'Admin123!';
      const firstName = this.configService.get<string>('SUPERADMIN_FIRSTNAME') || 'Super';
      const lastName = this.configService.get<string>('SUPERADMIN_LASTNAME') || 'Admin';
      const phoneNumberStr = this.configService.get<string>('SUPERADMIN_PHONE') || '1234567890';
      const phoneNumber = Number(phoneNumberStr);
      const profilePictureUrl = this.configService.get<string>('SUPERADMIN_PROFILE_PICTURE') || 'https://example.com/profile.jpg';
      // Check if a superadmin already exists
      const existingUser = await this.usersService.findOneByEmail(email);

      if (existingUser) {
        this.logger.log(`Superadmin with email ${email} already exists`);
        return;
      }

      // Create superadmin
      const superAdmin = await this.usersService.createSuperAdmin(
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        profilePictureUrl

      );

      this.logger.log(`Superadmin created: ${superAdmin.email}`);
    } catch (error) {
      this.logger.error(`Failed to create superadmin: ${error.message}`);
      throw error;
    }
  }

  /**
   * Seed the database with initial permissions
   */
  async seedPermissions() {
    try {
      const permissions = [
        // User management permissions
        { name: Permission.USER_CREATE, displayName: 'Create User', description: 'Allows creating new users', category: 'user-management' },
        { name: Permission.USER_READ, displayName: 'Read User', description: 'Allows viewing user information', category: 'user-management' },
        { name: Permission.USER_UPDATE, displayName: 'Update User', description: 'Allows updating user information', category: 'user-management' },
        { name: Permission.USER_DELETE, displayName: 'Delete User', description: 'Allows deleting users', category: 'user-management' },
        
        // Retailer specific permissions
        { name: Permission.RETAILER_MANAGE_PRODUCTS, displayName: 'Manage Products', description: 'Allows managing retailer products', category: 'retailer' },
        { name: Permission.RETAILER_MANAGE_ORDERS, displayName: 'Manage Orders', description: 'Allows managing retailer orders', category: 'retailer' },
        { name: Permission.RETAILER_VIEW_REPORTS, displayName: 'View Reports', description: 'Allows viewing retailer reports', category: 'retailer' },
        
        // Admin permissions
        { name: Permission.ADMIN_MANAGE_RETAILERS, displayName: 'Manage Retailers', description: 'Allows managing retailer accounts', category: 'admin' },
        { name: Permission.ADMIN_MANAGE_SETTINGS, displayName: 'Manage Settings', description: 'Allows managing system settings', category: 'admin' },
        { name: Permission.ADMIN_VIEW_ALL_REPORTS, displayName: 'View All Reports', description: 'Allows viewing all system reports', category: 'admin' },
        
        // SuperAdmin permissions
        { name: Permission.SUPERADMIN_MANAGE_ALL, displayName: 'Manage All', description: 'Full system access', category: 'superadmin' },
        
        // Role and Permission management permissions
        { name: Permission.ROLE_CREATE, displayName: 'Create Role', description: 'Allows creating new roles', category: 'role-management' },
        { name: Permission.ROLE_READ, displayName: 'Read Role', description: 'Allows viewing role information', category: 'role-management' },
        { name: Permission.ROLE_UPDATE, displayName: 'Update Role', description: 'Allows updating role information', category: 'role-management' },
        { name: Permission.ROLE_DELETE, displayName: 'Delete Role', description: 'Allows deleting roles', category: 'role-management' },
        { name: Permission.PERMISSION_CREATE, displayName: 'Create Permission', description: 'Allows creating new permissions', category: 'permission-management' },
        { name: Permission.PERMISSION_READ, displayName: 'Read Permission', description: 'Allows viewing permission information', category: 'permission-management' },
        { name: Permission.PERMISSION_UPDATE, displayName: 'Update Permission', description: 'Allows updating permission information', category: 'permission-management' },
        { name: Permission.PERMISSION_DELETE, displayName: 'Delete Permission', description: 'Allows deleting permissions', category: 'permission-management' },
      ];

      for (const permissionData of permissions) {
        try {
          await this.permissionsService.findByName(permissionData.name);
          this.logger.log(`Permission ${permissionData.name} already exists`);
        } catch (error) {
          // Permission doesn't exist, create it
          await this.permissionsService.create(permissionData);
          this.logger.log(`Permission created: ${permissionData.name}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to seed permissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Seed the database with initial roles
   */
  async seedRoles() {
    try {
      const roles = [
        {
          name: RoleEnum.SUPERADMIN,
          displayName: 'Super Administrator',
          description: 'Full system access with all permissions',
          permissionNames: [Permission.SUPERADMIN_MANAGE_ALL]
        },
        {
          name: RoleEnum.ADMIN,
          displayName: 'Administrator',
          description: 'Administrative access with most permissions',
          permissionNames: [
            Permission.USER_CREATE, Permission.USER_READ, Permission.USER_UPDATE, Permission.USER_DELETE,
            Permission.ADMIN_MANAGE_RETAILERS, Permission.ADMIN_MANAGE_SETTINGS, Permission.ADMIN_VIEW_ALL_REPORTS
          ]
        },
        {
          name: RoleEnum.RETAILER,
          displayName: 'Retailer',
          description: 'Retailer access with limited permissions',
          permissionNames: [
            Permission.USER_READ,
            Permission.RETAILER_MANAGE_PRODUCTS, Permission.RETAILER_MANAGE_ORDERS, Permission.RETAILER_VIEW_REPORTS
          ]
        },
        {
          name: RoleEnum.USER,
          displayName: 'User',
          description: 'Basic user access',
          permissionNames: [Permission.USER_READ]
        }
      ];

      for (const roleData of roles) {
        try {
          await this.rolesService.findByName(roleData.name);
          this.logger.log(`Role ${roleData.name} already exists`);
        } catch (error) {
          // Role doesn't exist, create it
          // First get permission IDs
          const permissions: string[] = [];
          for (const permissionName of roleData.permissionNames) {
            try {
              const permission = await this.permissionsService.findByName(permissionName);
              permissions.push(permission.id);
            } catch (e) {
              this.logger.warn(`Permission ${permissionName} not found when creating role ${roleData.name}`);
            }
          }

          await this.rolesService.create({
            name: roleData.name,
            displayName: roleData.displayName,
            description: roleData.description,
            permissionIds: permissions
          });
          this.logger.log(`Role created: ${roleData.name}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to seed roles: ${error.message}`);
      throw error;
    }
  }
}

