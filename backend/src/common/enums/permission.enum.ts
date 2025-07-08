export enum Permission {
  // User management permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Retailer specific permissions
  RETAILER_MANAGE_PRODUCTS = 'retailer:manage-products',
  RETAILER_MANAGE_ORDERS = 'retailer:manage-orders',
  RETAILER_VIEW_REPORTS = 'retailer:view-reports',
  
  // Admin permissions
  ADMIN_MANAGE_RETAILERS = 'admin:manage-retailers',
  ADMIN_MANAGE_SETTINGS = 'admin:manage-settings',
  ADMIN_VIEW_ALL_REPORTS = 'admin:view-all-reports',
  
  // SuperAdmin permissions
  SUPERADMIN_MANAGE_ALL = 'superadmin:manage-all',
  
  // Role and Permission management permissions
  ROLE_CREATE = 'role:create',
  ROLE_READ = 'role:read',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  PERMISSION_CREATE = 'permission:create',
  PERMISSION_READ = 'permission:read',
  PERMISSION_UPDATE = 'permission:update',
  PERMISSION_DELETE = 'permission:delete',
  
  // Menu management permissions
  MENU_CREATE = 'menu:create',
  MENU_READ = 'menu:read',
  MENU_UPDATE = 'menu:update',
  MENU_DELETE = 'menu:delete',
}

