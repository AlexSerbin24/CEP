import { Body, Controller, Post, Headers, Ip, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDataDto } from './dto/signin-data.dto';
import { SessionMetadata } from './types/session-metadata.type';
import type { Request, Response } from 'express';
import { SignUpDataDto } from './dto/signup-data.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post("signIn")
  @HttpCode(HttpStatus.OK)
  async signIn(@Res({passthrough:true}) response: Response, @Body() signInDataDto: SignInDataDto, @Headers("user-agent") userAgent, @Ip() ip) {
    const sessionData: SessionMetadata = { userAgent, ip }
    const { accessToken, refreshToken } = await this.authService.signIn(signInDataDto, sessionData)

    response.cookie("refreshToken", refreshToken, { httpOnly: true })

    return { accessToken }
  }

  @Post("signUp")
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Res({passthrough:true}) response: Response, @Body() signUpDataDto: SignUpDataDto, @Headers("user-agent") userAgent, @Ip() ip) {
    const sessionData: SessionMetadata = { userAgent, ip }
    const { accessToken, refreshToken } = await this.authService.signUp(signUpDataDto, sessionData)

    response.cookie("refreshToken", refreshToken, { httpOnly: true })

    return { accessToken }

  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refreshToken']

    await this.authService.logout(refreshToken)

    response.clearCookie("refreshToken", { httpOnly: true })

    return { message: "Logged out succesfully" }
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response, @Headers("user-agent") userAgent, @Ip() ip) {
    const refreshToken = request.cookies['refreshToken']

    const sessionData: SessionMetadata = { userAgent, ip }
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh(refreshToken, sessionData)

    response.cookie("refreshToken", newRefreshToken, { httpOnly: true })

    return {accessToken}

  }
}
