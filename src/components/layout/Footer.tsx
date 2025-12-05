import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center group transition-transform duration-300" aria-label="Home">
              <img
                src="/Logo-1024x236.png"
                alt="NanoEnrich Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering Life Through Eco-Nano Innovation
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=Skincare" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link to="/products?category=Supplements" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Supplements
                </Link>
              </li>
              <li>
                <Link to="/products?category=Hair Care" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link to="/products?category=Wellness" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Wellness
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  54/1, 2nd Street
                  Near Cauvery Tank,
                  MVM Nagar, Dindigul,
                  Tamil Nadu
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">+91 88701 73412</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">nanoenrich@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NanoEnrich. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
