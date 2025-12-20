import { Injectable } from '@nestjs/common';
import { AddressRepository } from '../../../application/ports/repositories/address.repository';
import { UserAddress } from '../../../domain/entities/address.entity';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaAddressRepository implements AddressRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByUserId(userId: string): Promise<UserAddress | null> {
        const address = await this.prisma.userAddress.findUnique({
            where: { userId },
        });

        if (!address) return null;

        return {
            id: address.id,
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            address2: address.address2 || undefined,
            postalCode: address.postalCode,
            phone: address.phone,
            city: address.city,
            countryId: address.countryId,
            userId: address.userId,
        };
    }

    async create(addressData: Omit<UserAddress, 'id'>): Promise<UserAddress> {
        const address = await this.prisma.userAddress.create({
            data: addressData,
        });

        return {
            id: address.id,
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            address2: address.address2 || undefined,
            postalCode: address.postalCode,
            phone: address.phone,
            city: address.city,
            countryId: address.countryId,
            userId: address.userId,
        };
    }

    async update(id: string, addressData: Partial<UserAddress>): Promise<UserAddress> {
        const address = await this.prisma.userAddress.update({
            where: { id },
            data: addressData,
        });

        return {
            id: address.id,
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            address2: address.address2 || undefined,
            postalCode: address.postalCode,
            phone: address.phone,
            city: address.city,
            countryId: address.countryId,
            userId: address.userId,
        };
    }

    async delete(id: string): Promise<void> {
        await this.prisma.userAddress.delete({
            where: { id },
        });
    }
}
