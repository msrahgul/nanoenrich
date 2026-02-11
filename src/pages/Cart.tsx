import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto w-full">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/50 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8 text-sm md:text-base px-4">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/products" className="block w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white" size="lg">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 overflow-x-hidden">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-secondary mb-6">
          Shopping Cart ({items.length})
        </h1>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id} className="overflow-hidden border shadow-sm">
                <CardContent className="p-3 md:p-4">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.id}`} className="shrink-0">
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-md overflow-hidden bg-muted border border-border">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details - Flexible container to prevent overflow */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link to={`/product/${item.product.id}`} className="min-w-0">
                            <h3 className="font-semibold text-sm md:text-base text-foreground hover:text-secondary transition-colors line-clamp-2 leading-tight">
                              {item.product.name}
                            </h3>
                          </Link>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.product.category}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-md bg-background h-8 md:h-9">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 hover:bg-muted"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 md:w-8 text-center text-xs md:text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 hover:bg-muted"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm md:text-base text-foreground whitespace-nowrap">
                            ₹{(item.product.price * item.quantity).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 mt-2 lg:mt-0">
            <Card className="sticky top-20 shadow-sm border-secondary/20 bg-card">
              <CardHeader className="bg-muted/30 pb-4 pt-5 px-5">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 px-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-end">
                  <span className="font-semibold text-base">Total</span>
                  <span className="font-bold text-xl text-secondary">₹{total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="px-5 pb-5 pt-0">
                <Link to="/checkout" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-[0.98]" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;