import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/env.config';
import { InitialSeedService } from './seeders/initial-seed.service';
import { UsersModule } from '../modules/users/users.module';
import { RolesModule } from '../modules/roles/roles.module';
import { PermissionsModule } from '../modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        
        if (!dbConfig) {
          throw new Error('Database configuration not found. Please check your environment variables.');
        }
        
        return {
          type: 'mysql',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: process.env.NODE_ENV === 'development', // Only use in development!
          logging: process.env.NODE_ENV === 'development',
          autoLoadEntities: true,
        };
      },
    }),
    // Import modules for seeding
    UsersModule,
    RolesModule,
    PermissionsModule,
  ],
  providers: [InitialSeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

