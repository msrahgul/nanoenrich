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
  stockStatus: 'in-stock' | 'out-of-stock' | 'to-be-launched';
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// New Order Interface
export interface Order {
  id: string;
  customer: {
    fullName: string;
    mobile: string;
    email: string;
    pincode: string;
    flat: string;
    area: string;
    landmark: string;
    city: string;
    state: string;
  };
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}