export interface UserAddress {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  postalCode: string;
  phone: string;
  city: string;
  countryId: string;
  userId: string;
}

export interface OrderAddress {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  postalCode: string;
  city: string;
  phone: string;
  countryId: string;
  orderId: string;
}
