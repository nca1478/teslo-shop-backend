import { UserAddress } from '../../../domain/entities/address.entity';

export interface AddressRepository {
  findByUserId(userId: string): Promise<UserAddress | null>;
  create(address: Omit<UserAddress, 'id'>): Promise<UserAddress>;
  update(id: string, address: Partial<UserAddress>): Promise<UserAddress>;
  delete(id: string): Promise<void>;
}
