export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  category: string;
  image: string;
  ingredients?: string;
  benefits?: string[];
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}
