import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu } from './entities/menu.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Role, Permission])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService, TypeOrmModule],
})
export class MenuModule {}
