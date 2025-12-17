export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  productId: string;
  orderId: string;
}

export interface Order {
  id: string;
  subTotal: number;
  tax: number;
  total: number;
  itemsInOrder: number;
  isPaid: boolean;
  paidAt?: Date;
  transactionId?: string;
  userId: string;
  orderItems: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
