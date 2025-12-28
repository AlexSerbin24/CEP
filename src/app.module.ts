import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [AuthModule, UserModule, TokenModule, RoleModule, PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CloudinaryModule,],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
