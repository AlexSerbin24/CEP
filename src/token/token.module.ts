import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [],
    controllers: [],
    providers: [TokenService, PrismaService],
})
export class TokenModule { }
