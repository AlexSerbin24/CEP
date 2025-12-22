import { IsString, IsEmail, MinLength, Matches, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { SignUpDataDto } from './signup-data.dto';

export class SignInDataDto  implements Omit<SignUpDataDto, "passwordConfirm" | "name" | "lastName"> {

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

}