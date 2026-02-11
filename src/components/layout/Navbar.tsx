import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, LogOut, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
      (isScrolled || !isHomePage)
        ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-900/10 py-0"
        : "bg-white shadow-sm lg:bg-transparent lg:shadow-none py-2 md:py-4 border-transparent"
    )}>
      <nav className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0" aria-label="Home">
            <img
              src="/Logo-1024x236.png"
              alt="NanoEnrich Logo"
              className="h-8 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation - Hidden until lg (large tablet/laptop) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-1",
                  location.pathname === link.path
                    ? "text-secondary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-secondary"
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                to="/admin"
                className="text-sm font-medium text-secondary flex items-center gap-1 hover:text-primary transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 md:gap-4">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className={cn(
                "h-9 w-9 hover:bg-emerald-50 text-emerald-900 transition-colors",
                (isScrolled || !isHomePage) ? "" : "lg:text-white lg:hover:bg-white/10"
              )}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile/Tablet Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden h-9 w-9 hover:bg-emerald-50 text-emerald-900",
                (isScrolled || !isHomePage) ? "" : "lg:text-white lg:hover:bg-white/10"
              )}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Neat & Proper Mobile Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-emerald-900/5 lg:hidden animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-lg font-medium transition-colors flex items-center justify-between",
                    location.pathname === link.path
                      ? "bg-emerald-50 text-emerald-900"
                      : "text-emerald-900 hover:bg-emerald-50/50"
                  )}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  )}
                </Link>
              ))}

              {isAuthenticated && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-lg font-medium text-secondary hover:bg-emerald-50/50 transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}