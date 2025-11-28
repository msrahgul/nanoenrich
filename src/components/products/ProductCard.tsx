import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-lg", className)}>
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-[#7EC242] text-white">
              -{discount}%
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <Badge className="mb-2 text-xs bg-[#5E3A86]/10 text-[#5E3A86] hover:bg-[#5E3A86]/20 border-none">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-[#5E3A86] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#5E3A86]">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          
          <Button
              className="bg-[#7EC242] hover:bg-[#7EC242]/90 text-white border-none"
              size="sm"
              onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
