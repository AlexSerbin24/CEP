import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should find a user by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'Test', role: {} });
    const user = await service.findById(1);
    expect(user.id).toBe(1);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });

  it('should return all users', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const users = await service.findAll();
    expect(users).toHaveLength(2);
  });
});
