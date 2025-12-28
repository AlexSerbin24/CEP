import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports:[CloudinaryModule],
  exports:[UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
