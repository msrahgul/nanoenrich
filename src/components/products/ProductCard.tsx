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
            <Badge className="absolute top-3 left-3 bg-primary text-white">
              -{discount}%
            </Badge>
          )}
          {product.stockStatus !== 'in-stock' && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="secondary" className="px-4 py-1 text-sm font-medium shadow-sm">
                {product.stockStatus === 'out-of-stock' ? 'Out of Stock' : 'To be Launched'}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <Badge className="mb-2 text-xs bg-secondary/10 text-secondary hover:bg-secondary/20 border-none">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        </Link>

        <div className="flex items-center justify-between min-h-[40px]">
          {product.stockStatus === 'in-stock' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-secondary">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>

              <Button
                className="bg-primary hover:bg-primary/90 text-white border-none transition-transform hover:scale-110 active:scale-95"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center w-full">
              <span className={cn(
                "text-sm font-semibold px-3 py-1 rounded-full",
                product.stockStatus === 'out-of-stock'
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              )}>
                {product.stockStatus === 'out-of-stock' ? 'Currently Unavailable' : 'Coming Soon'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
