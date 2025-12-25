import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { RoleService } from '../role/role.service';
import { TokenModule } from '../token/token.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [UserModule, TokenModule, RoleModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
