import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase'; 
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, runTransaction 
} from 'firebase/firestore';

interface ProductContextType {
  products: Product[];
  categories: string[];
  orders: Order[];
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
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Promise<string>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore Collections
  const productsCol = collection(db, 'products');
  const categoriesCol = collection(db, 'categories');
  const ordersCol = collection(db, 'orders');

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Products
      const prodSnap = await getDocs(productsCol);
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));

      // Fetch Categories
      const catSnap = await getDocs(categoriesCol);
      const catNames = catSnap.docs.map(d => d.data().name);
      setCategories(['All', ...catNames]);

      // Fetch Orders (Sorted by date descending)
      const q = query(ordersCol, orderBy('date', 'desc'));
      const ordSnap = await getDocs(q);
      setOrders(ordSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));

    } catch (error) {
      console.error("Firebase Error:", error);
      // Optional: Suppress initial toast to avoid noise on first load
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. Product Actions ---
  const addProduct = async (data: Omit<Product, 'id'>) => {
    try {
      const docRef = await addDoc(productsCol, data);
      setProducts(prev => [{ ...data, id: docRef.id }, ...prev]);
      toast({ title: "Success", description: "Product added." });
    } catch (e) { console.error(e); }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updates);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      toast({ title: "Success", description: "Product updated." });
    } catch (e) { console.error(e); }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Product removed." });
    } catch (e) { console.error(e); }
  };

  // --- 3. Category Actions ---
  const addCategory = async (category: string) => {
    try {
      await addDoc(categoriesCol, { name: category });
      setCategories(prev => [...prev, category]);
    } catch (e) { console.error(e); }
  };

  const deleteCategory = async (category: string) => {
    if (category === 'All') return;
    try {
      const q = query(categoriesCol); 
      const snapshot = await getDocs(q);
      const docToDelete = snapshot.docs.find(d => d.data().name === category);
      if (docToDelete) {
        await deleteDoc(doc(db, 'categories', docToDelete.id));
        setCategories(prev => prev.filter(c => c !== category));
      }
    } catch (e) { console.error(e); }
  };

  // --- 4. Order Actions (SEQUENTIAL ID LOGIC) ---
  const placeOrder = async (data: Omit<Order, 'id' | 'date' | 'status'>) => {
    try {
      const orderDate = new Date().toISOString();
      const status: Order['status'] = 'Pending';

      // Run a transaction to get the next ID safely
      const newOrderId = await runTransaction(db, async (transaction) => {
        // Reference to the counter document
        const counterRef = doc(db, "counters", "orderCounter");
        const counterSnap = await transaction.get(counterRef);

        let currentCount = 0;
        if (counterSnap.exists()) {
          currentCount = counterSnap.data().count || 0;
        }

        // Increment ID
        const nextCount = currentCount + 1;
        const nextId = nextCount.toString(); // ID will be "1", "2", "3"...

        // Create the new order object
        const newOrderData = {
          ...data,
          id: nextId,
          date: orderDate,
          status: status
        };

        // Reference to the new order document (using the ID as the doc name)
        const newOrderRef = doc(db, "orders", nextId);

        // Commit updates: Save order AND update counter
        transaction.set(newOrderRef, newOrderData);
        transaction.set(counterRef, { count: nextCount });

        return nextId;
      });

      // Update Local State
      const newOrder = { 
        ...data, 
        id: newOrderId, 
        date: orderDate, 
        status: status 
      } as Order;
      
      setOrders(prev => [newOrder, ...prev]);
      return newOrderId;

    } catch (error) {
      console.error("Transaction failed: ", error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast({ title: "Status Updated", description: `Order marked as ${status}` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  // --- Helpers ---
  const getProductById = (id: string) => products.find(p => p.id === id);
  const getProductsByCategory = (cat: string) => cat === 'All' ? products : products.filter(p => p.category === cat);
  const searchProducts = (q: string) => products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const getFeaturedProducts = () => products.filter(p => p.featured);

  return (
    <ProductContext.Provider value={{
      products, categories, orders, isLoading,
      addProduct, updateProduct, deleteProduct,
      getProductById, getProductsByCategory, searchProducts, getFeaturedProducts,
      addCategory, deleteCategory, placeOrder, updateOrderStatus
    }}>
      {children}
    </ProductContext.Provider>
  );
};