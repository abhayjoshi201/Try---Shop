export enum OrderStatus {
  PLACED = 'PLACED',
  PACKED = 'PACKED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED'
}

export enum Role {
  CUSTOMER = 'CUSTOMER',
  STORE_OPS = 'STORE_OPS',
  RIDER = 'RIDER'
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  price: number;
  image: string;
  stock: number;
}

export interface LineItem {
  productId: string;
  quantity: number;
  isTryAndBuyExtra: boolean; // True if added automatically by the system/ops
  kept?: boolean; // For Rider flow
}

export interface Order {
  id: string;
  customerName: string;
  createdAt: string;
  status: OrderStatus;
  isTryAndBuy: boolean;
  items: LineItem[];
  totalValue: number;
  finalPaidValue?: number;
}
