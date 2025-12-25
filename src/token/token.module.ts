import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    exports:[TokenService],
    providers: [TokenService],
})
export class TokenModule { }
