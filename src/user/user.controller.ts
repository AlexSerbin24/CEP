import { Body, Controller, Delete, Get, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UserPayload } from '../common/types/user-payload.type';
import { ImageValidationPipe } from '../cloudinary/pipes/image-validation.pipe';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService
  ) { }


  @Get('me')
  async getProfile(@Req() request: Request) {
    const { id } = request.user as UserPayload
    return await this.userService.findById(id);
  }


  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(@Body() createUserDto: UpdateUserDto, @UploadedFile(new ImageValidationPipe()) avatar: Express.Multer.File, @Req() request: Request) {
    const { id } = request.user as UserPayload

    let newAvatarLink = undefined;

    if (avatar) {
      const { avatarLink } = await this.userService.findById(id)

      if (avatarLink)
        await this.cloudinaryService.deleteFile(avatarLink)

      const { secure_url } = await this.cloudinaryService.uploadFile(avatar)

      newAvatarLink = secure_url

    }


    return this.userService.update(id, createUserDto, newAvatarLink)
  }

  @Delete('me')
  deleteUser(@Req() request: Request) {
    const { id } = request.user as UserPayload
    return this.userService.remove(id);
  }
}
