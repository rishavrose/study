import { Role } from '../../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;          // User ID
  email: string;        // User email
  role: Role;           // User role
  permissions: string[]; // User permissions
  iat?: number;         // Issued at timestamp
  exp?: number;         // Expiration timestamp
}

