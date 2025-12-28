import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { UserResponseDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    //create user
    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.prisma.user.create({
            data: {
                name: createUserDto.name,
                lastName: createUserDto.lastName,
                email: createUserDto.email,
                password: createUserDto.password,
                role: { connect: { id: createUserDto.roleId } },
            },
            include: { role: true },
        });

        return this.toResponseDto(user);
    }

    // Get all users
    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.prisma.user.findMany({ include: { role: true } });
        return users.map((user)=>this.toResponseDto(user));
    }

    // Find by ID
    async findById(id: number, includePassword = false): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });

        if (!user) throw new NotFoundException('User not found');
        return this.toResponseDto(user, includePassword);
    }

    //Find by email
    async findByEmail(email: string, includePassword = false): Promise<UserResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
        return user ? this.toResponseDto(user, includePassword) : null;
    }

    // Update user
    async update(id: number, updateUserDto: UpdateUserDto, newAvatarLink:string|undefined): Promise<UserResponseDto> {
        await this.findById(id);

        const data: any = { ...updateUserDto };
        if (newAvatarLink) {
            data.avatarLink = newAvatarLink
        }

        const user = await this.prisma.user.update({
            where: { id },
            data,
            include: { role: true },
        });

        return this.toResponseDto(user);
    }

    // Remove user
    async remove(id: number): Promise<UserResponseDto> {
        await this.findById(id);
        const user = await this.prisma.user.delete({
            where: { id },
            include: { role: true },
        });
        return this.toResponseDto(user);
    }

    //Helper to convert Prisma User -> UserResponseDto
    private toResponseDto(user: any, includePassword: boolean = false): UserResponseDto {
        const data:UserResponseDto = {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
            roleId: user.roleId,
            avatarLink:user.avatarLink,
            roleName: user.role?.name
        };


        if(includePassword) data.password = user.password

        return data
    }
}