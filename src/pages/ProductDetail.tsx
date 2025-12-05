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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getProductById, getFeaturedProducts } = useProducts();
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = getFeaturedProducts()
    .filter((p) => p.id !== id)
    .slice(0, 4);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-primary text-white text-sm">
                -{discount}% OFF
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-3">
              {product.category}
            </Badge>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-secondary mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-secondary">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                  <Badge variant="secondary">Save ₹{product.originalPrice - product.price}</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground mb-6">{product.longDescription}</p>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Key Ingredients</h3>
                <p className="text-sm text-muted-foreground">{product.ingredients}</p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>

              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </div>

            {!product.inStock && (
              <p className="text-destructive mt-4 text-sm">This product is currently out of stock.</p>
            )}

            {/* Trust Badge */}
            <Card className="mt-6 bg-accent/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Leaf className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">100% Natural & Organic</p>
                  <p className="text-xs text-muted-foreground">Free from harmful chemicals and additives</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-8">
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
