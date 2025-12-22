import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { RoleService } from '../role/role.service';

@Module({
  imports: [ UserModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RoleService],
})
export class AuthModule {}
