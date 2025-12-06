import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order } from '@/types'; // Import Order type
import { useToast } from '@/hooks/use-toast';

interface ProductContextType {
  products: Product[];
  categories: string[];
  orders: Order[]; // Add orders to state
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (query: string) => Product[];
  getFeaturedProducts: () => Product[];
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Promise<void>; // Add placeOrder
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

const API_URL = 'http://localhost:5000/api';

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [orders, setOrders] = useState<Order[]>([]); // Orders state
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, orderRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/orders`) // Fetch orders
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (orderRes.ok) setOrders(await orderRes.json());

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the backend.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ... Existing Product & Category functions (addProduct, updateProduct, etc.) ...

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (res.ok) {
      const newP = await res.json();
      setProducts(prev => [newP, ...prev]);
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = async (cat: string) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cat })
    });
    if (res.ok) {
      setCategories(prev => [...prev, cat]);
    }
  };

  const deleteCategory = async (cat: string) => {
    if (cat === 'All') return;
    const res = await fetch(`${API_URL}/categories/${encodeURIComponent(cat)}`, { method: 'DELETE' });
    if (res.ok) setCategories(prev => prev.filter(c => c !== cat));
  };


  // --- NEW: Order Actions ---

  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to place order');

      const newOrder = await response.json();
      setOrders(prev => [newOrder, ...prev]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast({ title: "Status Updated", description: `Order marked as ${status}` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  // Helper functions
  const getProductById = (id: string) => products.find(p => p.id === id);
  const getProductsByCategory = (cat: string) => cat === 'All' ? products : products.filter(p => p.category === cat);
  const searchProducts = (q: string) => products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const getFeaturedProducts = () => products.filter(p => p.featured);

  return (
    <ProductContext.Provider
      value={{
        products, categories, orders, isLoading,
        addProduct, updateProduct, deleteProduct,
        getProductById, getProductsByCategory, searchProducts, getFeaturedProducts,
        addCategory, deleteCategory,
        placeOrder, updateOrderStatus
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};