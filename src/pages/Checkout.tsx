import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { toast } from '@/hooks/use-toast';
import { Lock, CreditCard, ArrowLeft, ScanLine, Smartphone } from 'lucide-react';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { PaymentSettings } from '@/types';

// --- CONFIG ---
const EMAILJS_SERVICE_ID = "service_yc01lbo";
const EMAILJS_TEMPLATE_CUSTOMER = "template_90zv68f";
const EMAILJS_TEMPLATE_ADMIN = "template_j10mkvs";
const EMAILJS_PUBLIC_KEY = "3Vt2AYOx00XjFyM0I";
const LOGO_URL = "https://res.cloudinary.com/ddjzmk0uv/image/upload/v1769263722/Logo-1024x236_bsrhem.png";

const indianStates = [
  "ANDAMAN & NICOBAR ISLANDS", "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR", "CHANDIGARH", "CHHATTISGARH", "DADRA AND NAGAR HAVELI AND DAMAN AND DIU", "DELHI", "GOA", "GUJARAT", "HARYANA", "HIMACHAL PRADESH", "JAMMU & KASHMIR", "JHARKHAND", "KARNATAKA", "KERALA", "LADAKH", "LAKSHADWEEP", "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR", "MEGHALAYA", "MIZORAM", "NAGALAND", "ODISHA", "PUDUCHERRY", "PUNJAB", "RAJASTHAN", "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA", "UTTAR PRADESH", "UTTARAKHAND", "WEST BENGAL"
];

// --- SCHEMA ---
const customerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is too short'),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email format'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Invalid pincode'),
  flat: z.string().trim().min(1, 'Address is required'),
  area: z.string().trim().min(1, 'Area is required'),
  landmark: z.string().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().min(1, 'State is required'),
  transactionId: z.string().trim().min(4, 'Please enter a valid Transaction ID / UTR'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { placeOrder } = useProducts();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', email: '', pincode: '', flat: '', area: '', landmark: '', city: '', state: '',
    transactionId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment Config State
  const [paymentConfig, setPaymentConfig] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');

    // Fetch Payment Settings
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'payment_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setPaymentConfig(docSnap.data() as PaymentSettings);
    };
    fetchSettings();
  }, [items, navigate]);

  if (items.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelect = (name: string, val: string) => {
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Generate UPI Deep Link
  const getUPILink = () => {
    if (!paymentConfig) return '#';
    const params = new URLSearchParams({
      pa: paymentConfig.upiId,
      pn: paymentConfig.payeeName,
      am: total.toFixed(2),
      cu: 'INR'
    });
    return `upi://pay?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = customerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast({ title: "Check Fields", description: "Please complete all fields including payment details.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      // Pass transactionId to order data
      const orderData = { customer: formData, items, total, transactionId: formData.transactionId };
      const orderId = await placeOrder(orderData);

      const itemsList = items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">${item.product.name}</td>
          <td align="center">x${item.quantity}</td>
          <td align="right">₹${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>`).join('');

      const cleanAddress = [formData.flat, formData.area, formData.city, `${formData.state}-${formData.pincode}`].filter(Boolean).join(', ');

      const templateParams = {
        order_id: orderId,
        total: total.toFixed(2),
        logo_url: LOGO_URL,
        website_link: window.location.origin,
        to_name: formData.fullName,
        customer_name: formData.fullName,
        customer_mobile: formData.mobile,
        user_email: formData.email,
        to_email: formData.email,
        customer_address: cleanAddress,
        order_items: itemsList,
        transaction_id: formData.transactionId, // Added to Email
      };

      await Promise.all([
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, templateParams, EMAILJS_PUBLIC_KEY),
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CUSTOMER, templateParams, EMAILJS_PUBLIC_KEY)
      ]);

      toast({ title: "Order Placed!", description: `Order #${orderId} confirmed.` });
      clearCart();
      navigate('/');
    } catch (error) {
      console.error("Order Error:", error);
      toast({ title: "Order Warning", description: "Order saved, but email notification might have failed.", variant: "destructive" });
      clearCart();
      navigate('/');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </button>

        <h1 className="font-serif text-3xl font-bold text-secondary mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Payment Section - Inserted Before Address */}
            {paymentConfig && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <ScanLine className="h-5 w-5" /> Scan & Pay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-center">

                    {/* QR Code for Desktop */}
                    <div className="hidden md:block bg-white p-2 rounded shadow-sm border">
                      <img src={paymentConfig.qrImageUrl || "/placeholder.svg"} alt="UPI QR" className="w-48 h-48 object-contain" />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <p className="text-sm font-medium">Total Amount: <span className="text-xl font-bold ml-2">₹{total.toFixed(2)}</span></p>

                      {/* Mobile Pay Button */}
                      <div className="md:hidden">
                        <a href={getUPILink()} target="_blank" rel="noreferrer" className="w-full">
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <Smartphone className="mr-2 h-4 w-4" /> Pay via UPI App
                          </Button>
                        </a>
                        <p className="text-xs text-muted-foreground mt-2 text-center">Tap to open GPay / PhonePe</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Transaction ID (UTR) *</Label>
                        <Input
                          name="transactionId"
                          placeholder="Enter 12-digit UTR number after payment"
                          value={formData.transactionId}
                          onChange={handleChange}
                          className={errors.transactionId ? 'border-destructive bg-white' : 'bg-white'}
                        />
                        {errors.transactionId ? (
                          <p className="text-xs text-destructive">{errors.transactionId}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Required to verify your payment.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} id="checkout-form">
              <Card>
                <CardHeader><CardTitle>Delivery Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Name & Mobile */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input name="fullName" placeholder="Enter your name" value={formData.fullName} onChange={handleChange} className={errors.fullName ? 'border-destructive' : ''} />
                      {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number *</Label>
                      <Input name="mobile" placeholder="10-digit number" value={formData.mobile} onChange={handleChange} className={errors.mobile ? 'border-destructive' : ''} />
                      {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input name="email" type="email" placeholder="Required for order receipt" value={formData.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input name="pincode" placeholder="6-digit pincode" value={formData.pincode} onChange={handleChange} className={errors.pincode ? 'border-destructive' : ''} />
                    {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Flat/House No. *</Label>
                    <Input name="flat" placeholder="Apartment, Studio, or Floor" value={formData.flat} onChange={handleChange} className={errors.flat ? 'border-destructive' : ''} />
                    {errors.flat && <p className="text-xs text-destructive">{errors.flat}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Area/Street *</Label>
                    <Input name="area" placeholder="Street Name, Area" value={formData.area} onChange={handleChange} className={errors.area ? 'border-destructive' : ''} />
                    {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Landmark</Label>
                    <Input name="landmark" placeholder="E.g. Near Apollo Hospital" value={formData.landmark} onChange={handleChange} />
                  </div>

                  {/* City & State */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Town/City *</Label>
                      <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={errors.city ? 'border-destructive' : ''} />
                      {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select onValueChange={(val) => handleSelect('state', val)} value={formData.state}>
                        <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Choose a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
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
                        Place Order (₹{total.toFixed(2)})
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
            <div className="flex items-center gap-2 justify-center mt-4 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Your payment information is handled securely</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {items.map(i => (
                  <div key={i.product.id} className="flex gap-3">
                    <img src={i.product.image} alt={i.product.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {i.quantity}</p>
                      <p className="text-sm font-medium">₹{(i.product.price * i.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
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