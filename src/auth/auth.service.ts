import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignInDataDto } from './dto/signin-data.dto';
import { SignUpDataDto } from './dto/signup-data.dto';
import * as bcrypt from "bcryptjs"
import { ConfigService } from '@nestjs/config';
import { RoleService } from '../role/role.service';
import { SessionMetadata } from './types/session-metadata.type';
import { TokenService } from '../token/token.service';


@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roleService: RoleService,
        private readonly tokenService: TokenService
    ) { }

    async signIn(signInData: SignInDataDto, sessionData: SessionMetadata) {
        //check if user exists
        const { email, password } = signInData

        const checkUser = await this.userService.findByEmail(email, true);

        if (!checkUser) throw new UnauthorizedException("User was not found")

        //check password
        const checkPassword = await bcrypt.compare(password, checkUser.password!)

        if (!checkPassword) throw new UnauthorizedException("Password is incorrect")

        //create access token
        const accessToken = await this.generateAccessToken(checkUser.id, checkUser.roleName)

        //create refresh token
        const { userAgent, ip } = sessionData

        const refreshToken = await this.tokenService.createToken(checkUser.id, userAgent, ip)

        return { accessToken, refreshToken }


    }

    async signUp(signUpData: SignUpDataDto, sessionData: SessionMetadata) {
        //check if user  exists
        const { name, lastName, email, password } = signUpData

        const checkUser = await this.userService.findByEmail(email, true);

        if (checkUser) throw new ConflictException('User already exists')


        //create user and create access token
        const hashedPassword = await bcrypt.hash(password, 10)

        const { id } = (await this.roleService.findByName(this.configService.get<string>("ROLE_USER") as string))!

        const user = await this.userService.create({
            name,
            lastName,
            email,
            password: hashedPassword,
            roleId: id
        })

        const accessToken = await this.generateAccessToken(user.id, user.roleName)


        //create refresh token
        const { userAgent, ip } = sessionData

        const refreshToken = await this.tokenService.createToken(user.id, userAgent, ip)

        return { accessToken, refreshToken }


    }

    async logout(refreshToken: string) {

        if (!refreshToken) return;

        await this.tokenService.revokeToken(refreshToken);

    }

    //refresh token
    async refresh(refreshToken: string, sessionData: SessionMetadata) {
        const {userAgent, ip} = sessionData
        const {token:newRefreshToken, userId} = await this.tokenService.refreshToken(refreshToken, userAgent, ip)

        const user = await this.userService.findById(userId)

        const roleName = user.roleName

        const accessToken = await this.generateAccessToken(userId, roleName)

        return {accessToken, refreshToken:newRefreshToken}

    }


    private async generateAccessToken(userId: number, role: string) {
        const accessToken = await this.jwtService.signAsync(
            {
                sub: userId,
                role
            }
        );

        return accessToken;

    }
}
