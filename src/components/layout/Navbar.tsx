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
  const { totalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
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
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/products" className="hidden sm:flex">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Logout (Desktop) */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isOpen && (
          <div className="fixed inset-0 top-[57px] z-50 bg-background md:hidden animate-in fade-in slide-in-from-top-5 duration-200 flex flex-col">
            <div className="flex flex-col p-4 gap-2 border-t border-border bg-background h-full overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-lg font-medium py-4 px-4 rounded-lg transition-colors flex items-center justify-between",
                    location.pathname === link.path
                      ? "bg-secondary/10 text-secondary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {link.name}
                  {location.pathname === link.path && <div className="h-2 w-2 rounded-full bg-secondary" />}
                </Link>
              ))}

              <div className="my-2 border-t border-border" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className="text-lg font-medium py-3 px-4 rounded-lg text-secondary hover:bg-secondary/10 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start px-4 text-destructive hover:text-destructive hover:bg-destructive/10 text-lg h-auto py-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button className="w-full mt-2" size="lg">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}