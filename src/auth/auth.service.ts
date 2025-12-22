import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SignInDataDto } from '../dto/auth/signin-data.dto';
import { SignUpDataDto } from '../dto/auth/signup-data.dto';
import * as bcrypt from "bcryptjs"
import { ConfigService } from '@nestjs/config';
import { RoleService } from '../role/role.service';


@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roleService: RoleService
    ) { }

    async signIn(signInData: SignInDataDto) {
        const { email, password } = signInData

        const checkUser = await this.userService.findByEmail(email, true);

        if (!checkUser) throw new UnauthorizedException("User was not found")

        const checkPassword = await bcrypt.compare(password, checkUser.password!)

        if (!checkPassword) throw new UnauthorizedException("User was not found")

        const accessToken = await this.generateAccessToken(checkUser.id, checkUser.name, checkUser.lastName, checkUser.email, checkUser.roleName)


        //todo: refreshtoken logic
        // const refreshToken  = 

        return accessToken


    }

    async signUp(signUpData: SignUpDataDto) {
        const { name, lastName, email, password } = signUpData

        const checkUser = await this.userService.findByEmail(email, true);

        if (checkUser) throw new ConflictException('User already exists')

        const hashedPassword = await bcrypt.hash(password, 10)

        const { id } = (await this.roleService.findByName(this.configService.get<string>("ROLE_USER") as string))!

        const user = await this.userService.create({
            name,
            lastName,
            email,
            password: hashedPassword,
            roleId: id
        })

        const accessToken = await this.generateAccessToken(user.id, user.name, user.lastName, user.email, user.roleName)
        return accessToken

    }

    async logout() {

    }

    private async generateAccessToken(userId: number, name: string, lastName: string, email: string, role: string) {
        const accessToken = await this.jwtService.signAsync(
            {
                sub: userId,
                name,
                lastName,
                email,
                role
            }
        );

        return accessToken;

    }
}
