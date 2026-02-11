import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Check, Leaf } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/products/ProductCard';
import { cn } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getProductById, getFeaturedProducts } = useProducts();
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;

  // Exclude current product and get related
  const relatedProducts = getFeaturedProducts()
    .filter((p) => p.id !== id)
    .slice(0, 4);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          {/* Image Section */}
          <div className="relative w-full">
            <div className="aspect-square w-full max-w-md mx-auto lg:max-w-none rounded-xl overflow-hidden bg-muted border border-border">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-primary text-white text-xs md:text-sm px-3 py-1">
                -{discount}% OFF
              </Badge>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="mb-4">
              <Badge variant="outline" className="mb-3 text-secondary border-secondary/30">
                {product.category}
              </Badge>
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-secondary leading-tight mb-2">
                {product.name}
              </h1>
            </div>

            {/* Price Block */}
            {product.stockStatus === 'in-stock' && (
              <div className="flex items-end gap-3 mb-6 bg-accent/20 p-4 rounded-lg w-full md:w-fit">
                <span className="text-3xl font-bold text-secondary">₹{product.price}</span>
                {product.originalPrice && (
                  <div className="flex flex-col mb-1">
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
              {product.longDescription}
            </p>

            {/* Key Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Benefits</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="my-6" />

            {/* Action Buttons */}
            {product.stockStatus === 'in-stock' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border border-border rounded-lg bg-background">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12 text-base"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>

                  <Button
                    size="lg"
                    className="flex-1 h-12 text-base bg-primary hover:bg-primary/90 text-white"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className={cn(
                "p-4 rounded-xl border flex items-center justify-center gap-3 text-center",
                product.stockStatus === 'out-of-stock'
                  ? "bg-destructive/5 border-destructive/20 text-destructive"
                  : "bg-primary/5 border-primary/20 text-primary"
              )}>
                <div className={cn(
                  "h-2 w-2 rounded-full animate-pulse shrink-0",
                  product.stockStatus === 'out-of-stock' ? "bg-destructive" : "bg-primary"
                )} />
                <p className="font-semibold text-sm md:text-base">
                  {product.stockStatus === 'out-of-stock'
                    ? "Currently Out of Stock"
                    : "Coming Soon - To be Launched"}
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <Card className="bg-transparent border-dashed">
                <CardContent className="p-3 flex items-center gap-3">
                  <Leaf className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">100% Natural</p>
                    <p className="text-muted-foreground">Organic Ingredients</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-transparent border-dashed">
                <CardContent className="p-3 flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">Quality Tested</p>
                    <p className="text-muted-foreground">Certified Safe</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24 border-t border-border pt-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8 text-center md:text-left">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
