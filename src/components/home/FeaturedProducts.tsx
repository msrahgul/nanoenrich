import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/context/ProductContext';

export function FeaturedProducts() {
  const { getFeaturedProducts } = useProducts();
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Featured Products
            </h2>
            <p className="text-muted-foreground max-w-md">
              Discover our most popular natural wellness products, carefully selected for quality and effectiveness.
            </p>
          </div>
          <Link to="/products" className="mt-4 md:mt-0">
            <Button variant="ghost" className="group">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
