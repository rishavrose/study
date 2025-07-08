# Dynamic Menu System

This implementation provides a role and permission-based dynamic menu system for the NestJS + React application.

## Features

- **Role-based Menu Access**: Menus are filtered based on user roles (SUPERADMIN, ADMIN, RETAILER, USER)
- **Permission-based Menu Access**: Fine-grained control using specific permissions
- **Hierarchical Menu Structure**: Support for unlimited nesting levels
- **Database-driven**: All menu items are stored in the database
- **Dynamic Loading**: Frontend automatically fetches user-specific menus
- **Fallback Support**: Graceful degradation to static menu if API fails
- **Real-time Updates**: Menu changes are reflected immediately

## Backend Implementation

### Database Schema

The menu system uses the following entities:

- **Menu Entity** (`src/modules/menu/entities/menu.entity.ts`):
  - Stores menu hierarchy with parent-child relationships
  - Links to roles and permissions via many-to-many relationships
  - Supports menu metadata (icon, order, type, external links)

### API Endpoints

- `GET /menus/user-menus` - Get menus for current user
- `GET /menus` - Get all menus (admin only)
- `GET /menus/hierarchical` - Get hierarchical menu structure
- `POST /menus` - Create new menu item
- `PATCH /menus/:id` - Update menu item
- `DELETE /menus/:id` - Delete menu item
- `POST /menus/seed` - Seed default menu structure

### Menu Service

The `MenuService` handles:
- Role and permission-based filtering
- Hierarchical data loading
- Default menu seeding
- CRUD operations

## Frontend Implementation

### Dynamic Sidebar

The `Sidebar` component (`front/src/components/Layouts/Sidebar.tsx`) now:
- Uses the `useMenu` hook to fetch user-specific menus
- Converts API data to frontend-compatible format
- Falls back to static menu on API failures
- Shows loading and error states

### Menu Hook

The `useMenu` hook (`front/src/hooks/useMenu.ts`):
- Fetches menus from the backend API
- Handles authentication tokens
- Provides loading and error states
- Supports refetching

### Menu Converter

The menu converter (`front/src/utils/menuConverter.tsx`):
- Converts database menu format to frontend format
- Maps icon strings to React components
- Handles menu hierarchy and grouping
- Provides fallback static menu

## Setup Instructions

### 1. Database Migration

The menu tables are automatically created when you start the application with `synchronize: true` in development.

### 2. Seed Default Menus

Start the server and the initial menus will be seeded automatically:

```bash
npm run start:dev
```

Or manually seed via API:
```bash
POST /menus/seed
Authorization: Bearer <superadmin-token>
```

### 3. Frontend Configuration

The frontend automatically uses the dynamic menu system. You can access the menu management interface at:
```
http://localhost:3001/admin/menus
```

## Usage Examples

### Creating a New Menu Item

```bash
POST /menus
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "reports",
  "label": "Reports",
  "icon": "IconMenuReports",
  "type": "menu",
  "order": 10,
  "roleIds": ["admin-role-id", "superadmin-role-id"],
  "permissionIds": ["reports-read-permission-id"]
}
```

### Creating a Submenu

```bash
POST /menus
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "sales_reports",
  "label": "Sales Reports",
  "to": "/reports/sales",
  "type": "submenu",
  "order": 1,
  "parent_id": "reports-menu-id",
  "roleIds": ["admin-role-id"]
}
```

## Role and Permission Management

### Default Menu Access Rules

- **SUPERADMIN**: Access to all menus
- **ADMIN**: Access to administrative menus
- **RETAILER**: Access to retailer-specific menus
- **USER**: Access to basic user menus

### Custom Access Control

You can assign specific roles and permissions to any menu item:

1. Create the menu item via API
2. Assign roles using `roleIds` array
3. Assign permissions using `permissionIds` array
4. Menu will only show for users matching the criteria

## Menu Types

- **menu**: Top-level menu with potential submenus
- **submenu**: Menu item under a parent menu
- **section**: Visual separator/header in the menu

## Frontend Integration

The dynamic menu system integrates seamlessly with the existing frontend:

1. **Automatic Loading**: Menus load when user authenticates
2. **Icon Mapping**: Database icon strings map to React components
3. **Translation Support**: Menu labels use the i18n translation system
4. **Responsive Design**: Works with existing sidebar responsive behavior

## Testing the System

1. **Login as different users** to see role-based menu filtering
2. **Use the menu management page** at `/admin/menus` to view current structure
3. **Check browser console** for any API errors
4. **Test fallback behavior** by stopping the backend server

## Troubleshooting

### Menu Not Loading
- Check if user is authenticated (token in localStorage)
- Verify API endpoint is accessible
- Check browser console for error messages

### Menu Items Not Showing
- Verify user has required roles/permissions
- Check if menu items are marked as `isActive: true`
- Ensure menu hierarchy is correct

### Icons Not Displaying
- Verify icon names match the iconMap in menuConverter.tsx
- Add new icons to the icon mapping as needed

## Development Notes

- Menu data is cached in the frontend until page refresh
- Changes to menu structure require a refetch or page refresh
- The system gracefully handles network errors with fallback menus
- All menu operations require appropriate authentication and authorization

## Future Enhancements

- Real-time menu updates via WebSocket
- Menu item drag-and-drop reordering
- Visual menu builder interface
- Menu analytics and usage tracking
- Multi-language menu support
