import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Token } from '../generated/prisma/client';
import * as crypto from "crypto"


@Injectable()
export class TokenService {
    constructor(private readonly prisma: PrismaService) { }

    //Create new token
    async createToken(
        userId: number,
        userAgent: string,
        ip: string,
        expiresInDays: number = 30,
    ): Promise<string> {
        const token = this.generateToken();
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + expiresInDays);

        const data = await this.prisma.token.create({
            data: {
                userId,
                token,
                expiredAt,
                userAgent,
                ip,
            },
        });

        return data.token
    }

    //Find and validate token
    async validateToken(token: string): Promise<Token> {
        const tokenRecord = await this.prisma.token.findFirst({
            where: {
                token,
            },
            include: {
                user: true,
            },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid token');
        }

        if (tokenRecord.revokeAt) {
            throw new UnauthorizedException('Token has been revoked');
        }

        if (new Date() > tokenRecord.expiredAt) {
            throw new UnauthorizedException('Token has expired');
        }

        return tokenRecord;
    }

    //Revoke token
    async revokeToken(token: string): Promise<Token> {
        const tokenRecord = await this.prisma.token.findFirst({
            where: { token },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Token not found');
        }

        return this.prisma.token.update({
            where: { id: tokenRecord.id },
            data: { revokeAt: new Date() },
        });
    }

    // Revoked all user's tokens (after password change)
    async revokeAllUserTokens(userId: number): Promise<void> {
        await this.prisma.token.updateMany({
            where: {
                userId,
                revokeAt: null,
            },
            data: {
                revokeAt: new Date(),
            },
        });
    }


    //Refresh token
    async refreshToken(
        token: string,        
        userAgent: string,
        ip: string,
        expiresInDays: number = 30,
    ) {

        const tokenRecord = await this.validateToken(token);

        if (tokenRecord.ip !== ip || tokenRecord.userAgent !== userAgent) {
            console.warn(`Token used from different location: ${tokenRecord.userId}`);

            throw new UnauthorizedException('Suspicious activity detected');
        }

        const newToken = this.generateToken()
        const newExpiredAt = new Date();
        newExpiredAt.setDate(newExpiredAt.getDate() + expiresInDays);

        await this.prisma.$transaction([
            this.prisma.token.delete({
                where: { id: tokenRecord.id }
            }),

            this.prisma.token.create({
                data: {
                    token: newToken,
                    userId: tokenRecord.userId,
                    ip: ip,
                    userAgent: userAgent,
                    expiredAt: newExpiredAt,
                }
            })
        ]);

        return { token: newToken, userId: tokenRecord.userId };
    }

    //Generate refresh token
    private generateToken(): string {

        return crypto.randomBytes(64).toString('hex');
    }


    //Delte all obsoleter tokens(for cron job)
    async deleteObsoleteTokens(olderThanDays: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await this.prisma.token.deleteMany({
            where: {
                OR: [

                    {
                        revokeAt: {
                            not: null,
                            lt: cutoffDate,
                        },
                    },

                    {
                        expiredAt: {
                            lt: cutoffDate,
                        },
                    },
                ],
            },
        });

        return result.count;
    }
}