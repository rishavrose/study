import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpStatus, 
  Query, 
  HttpCode,
  BadRequestException,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ 
    description: 'The user has been successfully created.',
    type: User
  })
  @ApiConflictResponse({ description: 'Email already exists.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns a list of users with pagination metadata',
    schema: {
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Convert string query params to numbers
    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const limitNumber = limit ? parseInt(String(limit), 10) : 10;
    
    // Validate pagination params
    if (pageNumber < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    
    if (limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    
    return this.usersService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the user with the specified ID',
    type: User
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the updated user',
    type: User
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Invalid input data or UUID format.' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'User deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format.' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usersService.remove(id);
  }
}

