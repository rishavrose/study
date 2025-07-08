import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../../../common/enums/role.enum';
import { Permission } from '../../../common/enums/permission.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles and permissions from metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles or permissions are required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    // Get user from request
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admin bypass - always has access
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    // Check roles if required
    const hasRole = requiredRoles 
      ? requiredRoles.some(role => user.role === role)
      : true;

    // Check permissions if required
    const hasPermission = requiredPermissions
      ? requiredPermissions.some(permission => {
          // Check if user has this permission directly
          if (user.permissions && user.permissions.includes(permission)) {
            return true;
          }
          // For superadmin, check if they have the SUPERADMIN_MANAGE_ALL permission
          if (user.role === Role.SUPERADMIN && permission === Permission.SUPERADMIN_MANAGE_ALL) {
            return true;
          }
          return false;
        })
      : true;

    // Allow access if user has the required role AND permission (if both are specified)
    // If only one is specified, then only that check needs to pass
    if (requiredRoles && requiredPermissions) {
      return hasRole && hasPermission;
    }
    
    return hasRole || hasPermission;
  }
}

