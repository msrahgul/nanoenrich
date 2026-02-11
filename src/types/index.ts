export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
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

export interface Order {
  id: string;
  customer: {
    fullName: string;
    mobile: string;
    email: string;
    address: string;
    state: string;
    pincode: string;
  };
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  transactionId?: string; // Added for UPI tracking
}



// Added interface for Payment Settings
export interface PaymentSettings {
  upiId: string;
  payeeName: string;
  qrImageUrl: string;
}