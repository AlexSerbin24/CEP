import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { RoleService } from '../role/role.service';
import { TokenModule } from '../token/token.module';
import { RoleModule } from '../role/role.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [UserModule, TokenModule, RoleModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      } as JwtModuleOptions),
    })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
