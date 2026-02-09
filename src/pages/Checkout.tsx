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
import { Lock, CreditCard, ArrowLeft, ScanLine, Smartphone, Copy, Check } from 'lucide-react';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { PaymentSettings } from '@/types';

// --- EMAILJS CONFIG ---
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_UNIFIED = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const LOGO_URL = import.meta.env.VITE_LOGO_URL;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;


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
  const [isCopied, setIsCopied] = useState(false);

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

  const handleCopyLink = () => {
    const link = getUPILink();
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast({ title: "Link Copied", description: "Payment link copied to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
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
      toast({ title: "Check Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Save to Firestore
      const orderData = { customer: formData, items, total, transactionId: formData.transactionId };
      const orderId = await placeOrder(orderData);

      // 4. Prepare Common Data (Items List & Address)
      const itemsList = items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">${item.product.name}</td>
          <td align="center">x${item.quantity}</td>
          <td align="right">₹${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>`).join('');

      const cleanAddress = [
        formData.flat,
        formData.area,
        formData.landmark,
        formData.city,
        `${formData.state} - ${formData.pincode}`
      ].filter(Boolean).join(', ');

      // --- EMAIL 1: CUSTOMER CONFIRMATION ---
      const customerParams = {
        // Configuration
        to_email: formData.email,
        to_name: formData.fullName,       // "Hi Sara"
        logo_url: LOGO_URL,
        website_link: window.location.origin,
        reply_to: ADMIN_EMAIL,

        // Content
        subject: `Order Confirmation #${orderId} - NanoEnrich`,
        status_title: `Order Confirmation #${orderId}`,
        status_message: "Thank you for your order! We have received your request and payment details. We will verify the transaction and ship your items shortly.",
        highlight_info: `Payment Info: UTR ${formData.transactionId}`, // Shows UTR to customer

        // Data
        order_items: itemsList,
        total: total.toFixed(2),
        customer_address: cleanAddress,
      };

      // --- EMAIL 2: ADMIN ALERT (Reusing same template) ---
      const adminParams = {
        // Configuration
        to_email: ADMIN_EMAIL,
        to_name: "Admin",                        // "Hi Admin"
        logo_url: LOGO_URL,
        website_link: window.location.origin + "/login",
        reply_to: formData.email,

        // Content
        subject: `🔔 New Order: #${orderId} - ₹${total.toFixed(2)}`,
        status_title: `New Order Alert: #${orderId}`,
        status_message: `<b>${formData.fullName}</b> has placed a new order. <br/>Mobile: ${formData.mobile} <br/>Email: ${formData.email} <br/>Please verify the payment UTR below.`,
        highlight_info: `VERIFY PAYMENT: UTR ${formData.transactionId}`, // Highlight for Admin

        // Data
        order_items: itemsList,
        total: total.toFixed(2),
        customer_address: cleanAddress,
      };

      // 5. Send Both Emails in Parallel
      await Promise.all([
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_UNIFIED, customerParams, EMAILJS_PUBLIC_KEY),
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_UNIFIED, adminParams, EMAILJS_PUBLIC_KEY)
      ]);

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderId} saved. Confirmation email sent.`,
      });

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

            <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
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
              </Card>

              {/* Payment Section - Now Second */}
              {paymentConfig && (
                <Card className="border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
                  <div className="bg-primary/10 px-6 py-3 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-primary text-lg">
                      <ScanLine className="h-5 w-5" /> Finalize Payment
                    </CardTitle>
                  </div>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">

                      {/* QR Code */}
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded-lg shadow-sm border inline-block">
                          <img src={paymentConfig.qrImageUrl || "/placeholder.svg"} alt="UPI QR" className="w-48 h-48 object-contain" />
                        </div>
                        <p className="text-xs text-muted-foreground">Scan with any UPI App</p>
                      </div>

                      <div className="flex-1 space-y-6 w-full text-left">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Payable Amount</p>
                          <p className="text-4xl font-extrabold text-secondary">₹{total.toFixed(2)}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Pay Button - Mobile Only */}
                          <a href={getUPILink()} target="_blank" rel="noreferrer" className="w-full block md:hidden">
                            <Button className="w-full bg-green-600 hover:bg-green-700 h-12 shadow-md font-bold">
                              <Smartphone className="mr-2 h-4 w-4" /> Pay via UPI App
                            </Button>
                          </a>

                          {/* Copy Link Button */}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopyLink}
                            className="w-full border-primary/20 hover:bg-primary/5 h-12 shadow-sm font-medium"
                          >
                            {isCopied ? (
                              <><Check className="mr-2 h-4 w-4 text-green-600" /> Copied!</>
                            ) : (
                              <><Copy className="mr-2 h-4 w-4" /> Copy Payment Link</>
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between bg-white/50 p-2.5 rounded-md text-sm border border-dashed border-primary/30">
                            <span className="text-muted-foreground truncate mr-2">
                              UPI: <span className="font-mono font-semibold text-foreground select-all">{paymentConfig.upiId}</span>
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentConfig.upiId);
                                toast({ title: "UPI ID Copied" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border-2 border-primary/20 space-y-4 shadow-sm relative group transition-all duration-300 hover:border-primary/40">
                          <div className="space-y-2">
                            <Label className="text-xs text-primary uppercase font-bold tracking-widest">Step 3: Enter Transaction ID (UTR) *</Label>
                            <Input
                              name="transactionId"
                              placeholder="12-digit number from payment screen"
                              value={formData.transactionId}
                              onChange={handleChange}
                              className={`h-12 text-lg font-mono tracking-widest ${errors.transactionId ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                            />
                            {errors.transactionId ? (
                              <p className="text-xs text-destructive font-medium">{errors.transactionId}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">Important: Your order will be verified using this ID.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-primary/5 border-t border-primary/10 p-6">
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-lg font-bold shadow-xl transition-all active:scale-95"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing Order...' : (
                        <>
                          <CreditCard className="mr-3 h-5 w-5" />
                          Confirm & Place Order
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
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
                <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-hide space-y-4">
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
                </div>
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