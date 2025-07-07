import { Injectable, NotFoundException, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with password hashing
   * @param createUserDto - User data transfer object
   * @returns The created user (password excluded)
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      // Check if user with email already exists
      const existingUser = await this.findOneByEmail(createUserDto.email);

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(createUserDto.password);

      // Create new user with roles and permissions if provided
      const newUser = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || Role.USER,
        permissions: createUserDto.permissions || [],
      });

      // Save to database
      const savedUser = await this.usersRepository.save(newUser);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = savedUser as User;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists');
      }
      
      throw new BadRequestException('Could not create user');
    }
  }

  /**
   * Find all users with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Paginated list of users
   */
  async findAll(page = 1, limit = 10): Promise<{ users: User[], total: number, page: number, limit: number }> {
    try {
      const [users, total] = await this.usersRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        users,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new BadRequestException('Could not retrieve users');
    }
  }

  /**
   * Find a user by ID
   * @param id - User ID
   * @returns User if found
   * @throws NotFoundException if user not found
   */
  async findOne(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Could not retrieve user');
    }
  }

  /**
   * Find a user by email
   * @param email - User email
   * @param includePassword - Whether to include password field
   * @returns User if found, null otherwise
   */
  async findOneByEmail(email: string, includePassword = false): Promise<User | null> {
    try {
      if (includePassword) {
        return this.usersRepository
          .createQueryBuilder('user')
          .where('user.email = :email', { email })
          .addSelect('user.password')
          .getOne();
      }
      
      return this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      return null;
    }
  }

  /**
   * Update last login timestamp for a user
   * @param id - User ID
   * @returns Updated user
   */
  async updateLastLogin(id: string): Promise<User> {
    try {
      await this.usersRepository.update(id, {
        lastLoginAt: new Date(),
      });
      
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Could not update last login');
    }
  }

  /**
   * Create a superadmin user
   * @param email - Email address
   * @param password - Password
   * @param firstName - First name
   * @param lastName - Last name
   * @returns Created superadmin user
   */
  async createSuperAdmin(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: number,
    profilePictureUrl: string
  ): Promise<User> {
    try {
      // Check if user with email already exists
      const existingUser = await this.findOneByEmail(email);

      // If exists and is already a superadmin, return it
      if (existingUser && existingUser.role === Role.SUPERADMIN) {
        return existingUser;
      }

      // If exists but not a superadmin, throw error
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Create new superadmin with all permissions
      const superAdmin = await this.create({
        email,
        password,
        firstName,
        lastName,
        role: Role.SUPERADMIN,
        permissions: Object.values(Permission),
        isActive: true,
        accountStatus: 'verified',
        phoneNumber: phoneNumber?.toString(), // Optional, can be set later
        profilePictureUrl, // Optional, can be set later
      });

      return superAdmin as User;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Could not create superadmin');
    }
  }

  /**
   * Update a user by ID
   * @param id - User ID
   * @param updateUserDto - Updated user data
   * @returns Updated user
   * @throws NotFoundException if user not found
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // Check if user exists
      const user = await this.findOne(id);
      
      // Handle password update
      if (updateUserDto.password) {
        updateUserDto.password = await this.hashPassword(updateUserDto.password);
      }
      
      // Update user
      await this.usersRepository.update(id, updateUserDto);
      
      // Return updated user
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Could not update user');
    }
  }

  /**
   * Remove a user by ID
   * @param id - User ID
   * @returns Success message
   * @throws NotFoundException if user not found
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      // Check if user exists
      await this.findOne(id);
      
      // Delete user
      await this.usersRepository.delete(id);
      
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Could not delete user');
    }
  }

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}

