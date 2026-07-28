import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../application/ports/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    private mapToDomain(user: {
        id: string;
        email: string;
        password: string;
        name: string;
        role: string;
        otpHash: string | null;
        otpExpiresAt: Date | null;
        otpAttempts: number;
    }): User {
        return {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            isActive: true,
            roles: [user.role],
            createdAt: new Date(),
            updatedAt: new Date(),
            otpHash: user.otpHash,
            otpExpiresAt: user.otpExpiresAt,
            otpAttempts: user.otpAttempts,
        };
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return this.mapToDomain(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return this.mapToDomain(user);
    }

    async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email: userData.email,
                password: userData.password,
                name: userData.name,
                role: userData.roles[0] as Role,
            },
        });

        return this.mapToDomain(user);
    }

    async update(id: string, userData: Partial<User>): Promise<User> {
        const updateData: {
            email?: string;
            password?: string;
            name?: string;
            role?: Role;
        } = {};

        if (userData.email) updateData.email = userData.email;
        if (userData.password) updateData.password = userData.password;
        if (userData.name) updateData.name = userData.name;
        if (userData.roles && userData.roles.length > 0)
            updateData.role = userData.roles[0] as Role;

        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });

        return {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            isActive: userData.isActive ?? true,
            roles: [user.role],
            createdAt: new Date(),
            updatedAt: new Date(),
            otpHash: user.otpHash,
            otpExpiresAt: user.otpExpiresAt,
            otpAttempts: user.otpAttempts,
        };
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    name: 'asc',
                },
            }),
            this.prisma.user.count(),
        ]);

        return {
            users: users.map((user) => this.mapToDomain(user)),
            total,
        };
    }

    async updateOtp(
        id: string,
        otpData: { otpHash: string; otpExpiresAt: Date; otpAttempts: number },
    ): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                otpHash: otpData.otpHash,
                otpExpiresAt: otpData.otpExpiresAt,
                otpAttempts: otpData.otpAttempts,
            },
        });

        return this.mapToDomain(user);
    }

    async clearOtp(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: {
                otpHash: null,
                otpExpiresAt: null,
                otpAttempts: 0,
            },
        });
    }
}
