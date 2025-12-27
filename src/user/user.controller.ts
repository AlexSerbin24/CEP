import { Body, Controller, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UserPayload } from '../common/types/user-payload.type';
import { ImageValidationPipe } from '../cloudinary/pipes/image-validation.pipe';

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(@Body() createUserDto: UpdateUserDto, @UploadedFile(new ImageValidationPipe()) avatar: Express.Multer.File, @Req() request: Request) {  
    // const {id}  = request.user as UserPayload

    console.log("avatar")
    console.log(avatar)
    return true
    // return this.userService.update(id, createUserDto);
  }
}
