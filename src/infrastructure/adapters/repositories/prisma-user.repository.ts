import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../application/ports/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.name,
      isActive: true, // Assuming all users are active by default
      roles: [user.role],
      createdAt: new Date(), // Prisma doesn't have createdAt in the current schema
      updatedAt: new Date(), // Prisma doesn't have updatedAt in the current schema
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.name,
      isActive: true,
      roles: [user.role],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        name: userData.fullName,
        role: userData.roles[0] as any,
      },
    });

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.name,
      isActive: userData.isActive,
      roles: [user.role],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const updateData: any = {};

    if (userData.email) updateData.email = userData.email;
    if (userData.password) updateData.password = userData.password;
    if (userData.fullName) updateData.name = userData.fullName;
    if (userData.roles && userData.roles.length > 0)
      updateData.role = userData.roles[0];

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.name,
      isActive: userData.isActive ?? true,
      roles: [user.role],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        password: user.password,
        fullName: user.name,
        isActive: true,
        roles: [user.role],
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      total,
    };
  }
}
