import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      
      if (!user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }
      
      // Return user data for request.user
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
      };
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

