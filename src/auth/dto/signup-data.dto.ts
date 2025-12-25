import { IsString, IsEmail, MinLength, Matches, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class SignUpDataDto {
    @IsNotEmpty()
    @IsString() 
    name: string;
    
    @IsNotEmpty()
    @IsString() 
    lastName: string;

    @IsNotEmpty()
    @IsEmail() 
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @Match("password", {message:"Passwords must match"})
    passwordConfirm: string;
}