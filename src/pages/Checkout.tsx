import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext'; // Import ProductContext
import { toast } from '@/hooks/use-toast';
import { Lock, CreditCard, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

// --- Data Lists ---
const indianStates = [
  "ANDAMAN & NICOBAR ISLANDS", "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR", "CHANDIGARH", "CHHATTISGARH", "DADRA AND NAGAR HAVELI AND DAMAN AND DIU", "DELHI", "GOA", "GUJARAT", "HARYANA", "HIMACHAL PRADESH", "JAMMU & KASHMIR", "JHARKHAND", "KARNATAKA", "KERALA", "LADAKH", "LAKSHADWEEP", "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR", "MEGHALAYA", "MIZORAM", "NAGALAND", "ODISHA", "PUDUCHERRY", "PUNJAB", "RAJASTHAN", "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA", "UTTAR PRADESH", "UTTARAKHAND", "WEST BENGAL"
];

const customerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  flat: z.string().trim().min(1, 'Flat/House no. is required'),
  area: z.string().trim().min(1, 'Area/Street is required'),
  landmark: z.string().optional(),
  city: z.string().trim().min(2, 'Town/City is required'),
  state: z.string().min(1, 'State is required'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, total, clearCart } = useCart();
  const { placeOrder } = useProducts(); // Get the function to save to Firestore
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    pincode: '',
    flat: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // 1. Validate Form
    const result = customerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Prepare Order Data
      const orderData = {
        customer: formData,
        items: items,
        total: total,
      };

      // 3. Save to Firestore
      const orderId = await placeOrder(orderData); // This calls the function in ProductContext

      // 4. Send Email Notification
      // We don't await this to avoid blocking the UI if email service is slow
      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          data: {
            orderId,
            customer: formData,
            items: items.map(i => ({
              quantity: i.quantity,
              product: { name: i.product.name, price: i.product.price } // Minified data for email
            })),
            total
          }
        }),
      }).catch(err => console.error("Email failed:", err));

      // 5. Success!
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderId} saved. Confirmation email sent.`,
      });

      clearCart();
      navigate('/'); // Redirect to Home
    } catch (error) {
      console.error("Order failed:", error);
      toast({
        title: "Order Failed",
        description: "Could not save order. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <h1 className="font-serif text-3xl font-bold text-secondary mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name *</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className={errors.fullName ? 'border-destructive' : ''} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile number *</Label>
                    <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className={errors.mobile ? 'border-destructive' : ''} />
                    {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} className={errors.pincode ? 'border-destructive' : ''} />
                    {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flat">Flat, House no., Building, Company, Apartment *</Label>
                    <Input id="flat" name="flat" value={formData.flat} onChange={handleChange} className={errors.flat ? 'border-destructive' : ''} />
                    {errors.flat && <p className="text-xs text-destructive">{errors.flat}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area, Street, Sector, Village *</Label>
                    <Input id="area" name="area" value={formData.area} onChange={handleChange} className={errors.area ? 'border-destructive' : ''} />
                    {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Town/City *</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleChange} className={errors.city ? 'border-destructive' : ''} />
                      {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Select onValueChange={(value) => handleSelectChange('state', value)} value={formData.state}>
                        <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Choose a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((st) => (
                            <SelectItem key={st} value={st}>{st}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                    </div>
                  </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ₹{total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product.name} (x{item.quantity})</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;