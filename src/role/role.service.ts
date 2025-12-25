import {  Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';


@Injectable()
export class RoleService {
    constructor(private readonly prismaService: PrismaService) { }

    //Get all roles
    async findAll(): Promise<Role[]> {
        return this.prismaService.role.findMany({
            orderBy: { id: 'asc' },
        });
    }

    //Get role by id
    async findById(id: number): Promise<Role> {
        const role = await this.prismaService.role.findUnique({
            where: { id },
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        return role;
    }

    //Get role by name
    async findByName(name: string): Promise<Role | null> {
        return this.prismaService.role.findUnique({
            where: { name },
        });
    }

}