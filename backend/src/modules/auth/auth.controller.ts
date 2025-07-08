import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Request, 
  HttpCode, 
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  ValidationPipe,
  ForbiddenException,
  ConflictException,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBadRequestResponse, 
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiBody,
  ApiSecurity,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { Public } from './decorators/public.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
@ApiSecurity('bearer')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ 
    description: 'User login successful',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'john.doe@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', example: 'user' }
            

          }
        },
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input format or missing fields' })
  @ApiForbiddenResponse({ description: 'Account is disabled or locked' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  async login(@Body(new ValidationPipe({ whitelist: true })) loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Login failed. Please check your credentials.');
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ 
    description: 'User registered successfully',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'john.doe@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', example: 'user' }, 
            phoneNumber: { type: 'string', example: '1234567890' },
            profilePictureUrl: { type: 'string', example: 'https://example.com/profile.jpg' } 
          }
        },
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'User profile retrieved successfully',
    schema: {
      properties: {
        status: { type: 'string', example: 'success' },
        responseCode: { type: 'number', example: 200 },
        data: { $ref: '#/components/schemas/User' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  getProfile(@Request() req) {
    return {
      status: 'success',
      statusCode : 200,
      message: 'User profile retrieved successfully',
      data: req.user
    };
  }


  @Get('admin-panel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN) // Allow both admin and superadmin roles  
  @RequirePermissions(Permission.SUPERADMIN_MANAGE_ALL)
  @ApiOperation({ summary: 'Access admin panel' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin panel access granted' })
  @ApiForbiddenResponse({ description: 'Forbidden: Only admin or superadmin can access' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  getAdminPanel() {
    return { message: 'Welcome to admin panel',  status: 'success',
      statusCode : 200};
  }

  @Get('retailer-dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RETAILER)
  @RequirePermissions(Permission.RETAILER_VIEW_REPORTS)
  @ApiOperation({ summary: 'Access retailer dashboard' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Retailer dashboard access granted' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  getRetailerDashboard() {
    return { message: 'Welcome to retailer dashboard',status: 'success',
      statusCode : 200};
  }
}

