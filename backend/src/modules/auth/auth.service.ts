import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate user credentials
   * @param email - User email
   * @param password - Plain text password
   * @returns User object without password if valid
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Find user by email with password included
      const user = await this.usersService.findOneByEmail(email, true);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('User account is disabled');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Remove password from user object
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Login user and generate JWT token
   * @param loginDto - Login credentials
   * @returns JWT access token and user info
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);
    
    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
      // Optionally include refresh token logic here
      phoneno : user.phoneNumber, // Include phone number if needed
      profilePictureUrl: user.profilePictureUrl, // Include profile picture URL if needed
      status: 'success',
      statusCode : 200,
      message: 'User login successful',
    };
  }

  /**
   * Register a new user
   * @param registerDto - User registration data
   * @returns Created user and JWT token
   */
  async register(registerDto: RegisterDto) {
    try {
      // Default role assignment and permission mapping
      const role = registerDto.role || Role.USER;
      const permissions = this.getDefaultPermissionsForRole(role);
      
      // Create user with role and permissions
      const user = await this.usersService.create({
        ...registerDto,
        role,
        permissions,
      });
      
      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      };
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists');
      }
      
      throw new BadRequestException('Registration failed');
    }
  }

  /**
   * Get default permissions for a specific role
   * @param role - User role
   * @returns Array of permissions
   */
  private getDefaultPermissionsForRole(role: Role): Permission[] {
    switch (role) {
      case Role.SUPERADMIN:
        return [
          Permission.SUPERADMIN_MANAGE_ALL,
          Permission.ADMIN_MANAGE_RETAILERS,
          Permission.ADMIN_MANAGE_SETTINGS,
          Permission.ADMIN_VIEW_ALL_REPORTS,
          Permission.USER_CREATE,
          Permission.USER_READ,
          Permission.USER_UPDATE,
          Permission.USER_DELETE,
          Permission.RETAILER_MANAGE_PRODUCTS,
          Permission.RETAILER_MANAGE_ORDERS,
          Permission.RETAILER_VIEW_REPORTS,
        ];
        
      case Role.ADMIN:
        return [
          Permission.ADMIN_MANAGE_RETAILERS,
          Permission.ADMIN_MANAGE_SETTINGS,
          Permission.ADMIN_VIEW_ALL_REPORTS,
          Permission.USER_CREATE,
          Permission.USER_READ,
          Permission.USER_UPDATE,
          Permission.USER_DELETE,
        ];
        
      case Role.RETAILER:
        return [
          Permission.RETAILER_MANAGE_PRODUCTS,
          Permission.RETAILER_MANAGE_ORDERS,
          Permission.RETAILER_VIEW_REPORTS,
          Permission.USER_READ,
        ];
        
      case Role.USER:
      default:
        return [
          Permission.USER_READ,
        ];
    }
  }
}

