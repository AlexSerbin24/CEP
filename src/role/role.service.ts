import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { UpdateRoleDto } from '../dto/role/update-role.dto';

@Injectable()
export class RoleService {
    constructor(private readonly prismaService: PrismaService) { }

    /**
     * Получить все роли
     */
    async findAll(): Promise<Role[]> {
        return this.prismaService.role.findMany({
            orderBy: { id: 'asc' },
        });
    }

    /**
     * Получить роль по ID
     */
    async findById(id: number): Promise<Role> {
        const role = await this.prismaService.role.findUnique({
            where: { id },
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        return role;
    }

    /**
     * Получить роль по имени
     */
    async findByName(name: string): Promise<Role | null> {
        return this.prismaService.role.findUnique({
            where: { name },
        });
    }

    /**
     * Создать новую роль
     */
    async create(createRoleData: CreateRoleDto): Promise<Role> {
        const { name } = createRoleData
        const existingRole = await this.findByName(name);

        if (existingRole) {
            throw new ConflictException(`Role with name "${name}" already exists`);
        }

        return this.prismaService.role.create({
            data: {
                name
            },
        });
    }

    /**
     * Обновить роль
     */
    async update(id: number, updateRoleData: UpdateRoleDto): Promise<Role> {
        await this.findById(id); // Проверка существования

        const { name } = updateRoleData
        if (name) {
            const existingRole = await this.findByName(name);
            if (existingRole && existingRole.id !== id) {
                throw new ConflictException(`Role with name "${name}" already exists`);
            }
        }

        return this.prismaService.role.update({
            where: { id },
            data: {
                ...(name && { name }),
            },
        });
    }

    /**
     * Удалить роль
     */
    async delete(id: number): Promise<Role> {
        await this.findById(id); // Проверка существования

        const usersCount = await this.prismaService.user.count({
            where: { roleId: id },
        });

        if (usersCount > 0) {
            throw new ConflictException(
                `Cannot delete role. ${usersCount} user(s) are assigned to this role`,
            );
        }

        return this.prismaService.role.delete({
            where: { id },
        });
    }
}