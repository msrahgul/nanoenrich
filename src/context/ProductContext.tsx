import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { products as initialProducts, categories as initialCategories } from '@/data/products';

interface ProductContextType {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (query: string) => Product[];
  getFeaturedProducts: () => Product[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('nanoenrich_products');
    return stored ? JSON.parse(stored) : initialProducts;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem('nanoenrich_categories');
    return stored ? JSON.parse(stored) : initialCategories;
  });

  useEffect(() => {
    localStorage.setItem('nanoenrich_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nanoenrich_categories', JSON.stringify(categories));
  }, [categories]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id: string) => products.find(p => p.id === id);

  const getProductsByCategory = (category: string) => {
    if (category === 'All') return products;
    return products.filter(p => p.category === category);
  };

  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description.toLowerCase().includes(lowercaseQuery) ||
        p.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getFeaturedProducts = () => products.filter(p => p.featured);

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const deleteCategory = (category: string) => {
    if (category !== 'All') {
      setCategories(prev => prev.filter(c => c !== category));
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductsByCategory,
        searchProducts,
        getFeaturedProducts,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
