import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Page Imports
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Assets for Preloading
import { Preloader } from "@/components/layout/Preloader";
import { products } from "@/data/products";
import heroBg from "@/assets/hero-bg.jpg";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we've already shown the preloader this session
    const hasPreloaded = sessionStorage.getItem("hasPreloaded");

    if (hasPreloaded) {
      setIsLoading(false);
      return;
    }

    const preloadAssets = async () => {
      try {
        const imageUrls = [
          "/Logo-1024x236.png",
          heroBg,
          ...products.map((p) => p.image),
        ];

        const cacheImage = (src: string) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = resolve;
          });
        };

        await Promise.all(imageUrls.map((url) => cacheImage(url)));

        if (document.readyState !== 'complete') {
          await new Promise((resolve) => window.addEventListener('load', resolve));
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

      } catch (error) {
        console.error("Asset preloading failed:", error);
      } finally {
        sessionStorage.setItem("hasPreloaded", "true");
        setIsLoading(false);
      }
    };

    preloadAssets();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              {/* Show Preloader until loading is complete */}
              {isLoading ? (
                <Preloader />
              ) : (
                <BrowserRouter>
                  <ScrollToTop />
                  <div className="animate-in fade-in duration-700">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />

                      {/* Protected Admin Route */}
                      <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<Admin />} />
                      </Route>

                      {/* Catch-all */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              )}
            </TooltipProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
