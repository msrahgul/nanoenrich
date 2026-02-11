import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { toast } from '@/hooks/use-toast';
import { Lock, CreditCard, ArrowLeft, ScanLine, Smartphone, Copy, Check, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { PaymentSettings } from '@/types';

// --- CONFIG ---
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
  address: z.string().trim().min(5, 'Full address is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Invalid pincode'),
  transactionId: z.string().trim().min(4, 'Required for verification'),
  paymentMethod: z.enum(['online']),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { placeOrder } = useProducts();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', mobile: '', email: '', address: '', state: '', pincode: '',
    transactionId: '', paymentMethod: 'online' as 'online'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment Config State
  const [paymentConfig, setPaymentConfig] = useState<PaymentSettings | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');

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

    const result = customerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast({ title: "Check Fields", description: "Please fill in all required fields correctly.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const { transactionId, paymentMethod, ...customerDetails } = formData;

      const orderData = {
        customer: customerDetails,
        items,
        total,
        transactionId: formData.transactionId,
        paymentMethod: 'online',
        status: 'pending'
      };
      const orderId = await placeOrder(orderData);

      const itemsList = items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">${item.product.name}</td>
          <td align="center">x${item.quantity}</td>
          <td align="right">₹${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>`).join('');

      const cleanAddress = `${formData.address}, ${formData.state} - ${formData.pincode}`;

      const customerParams = {
        to_email: formData.email,
        to_name: formData.fullName,
        logo_url: LOGO_URL,
        website_link: window.location.origin,
        reply_to: ADMIN_EMAIL,
        subject: `Order Confirmation #${orderId} - NanoEnrich`,
        status_title: `Order Received #${orderId}`,
        status_message: "Thank you for your order! We have received your payment details. We will verify the transaction and ship your items shortly.",
        highlight_info: `Method: Online (UTR: ${formData.transactionId})`,
        order_items: itemsList,
        total: total.toFixed(2),
        customer_address: cleanAddress,
      };

      const adminParams = {
        to_email: ADMIN_EMAIL,
        to_name: "Admin",
        logo_url: LOGO_URL,
        website_link: window.location.origin + "/login",
        reply_to: formData.email,
        subject: `🔔 New Order: #${orderId} - ₹${total.toFixed(2)}`,
        status_title: `New Order Alert: #${orderId}`,
        status_message: `<b>${formData.fullName}</b> has placed a new order via <b>ONLINE (UPI)</b>. <br/>Mobile: ${formData.mobile} <br/>Email: ${formData.email}`,
        highlight_info: `PAYMENT: UTR ${formData.transactionId}`,
        order_items: itemsList,
        total: total.toFixed(2),
        customer_address: cleanAddress,
      };

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
      <div className="min-h-screen bg-background pb-20">

        {/* Sticky Header */}
        <div className="bg-card border-b border-border sticky top-14 md:top-16 z-30">
          <div className="container mx-auto px-4 py-3 md:py-4 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/cart')} className="h-8 gap-1 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-lg md:text-xl font-bold flex-1 text-center sm:text-left text-secondary">Secure Checkout</h1>
            <ShieldCheck className="h-5 w-5 text-green-600 hidden sm:block" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

              {/* LEFT: Forms */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                {/* Shipping Card */}
                <Card className="shadow-sm border-border overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg md:text-xl">Delivery Details</CardTitle>
                        <CardDescription className="text-xs">Enter your delivery information.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Full Name *</Label>
                        <Input name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} className={errors.fullName ? 'border-destructive' : ''} />
                        {errors.fullName && <p className="text-[10px] text-destructive">{errors.fullName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Mobile Number *</Label>
                        <Input name="mobile" placeholder="10-digit mobile" value={formData.mobile} onChange={handleChange} className={errors.mobile ? 'border-destructive' : ''} />
                        {errors.mobile && <p className="text-[10px] text-destructive">{errors.mobile}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Email Address *</Label>
                      <Input name="email" type="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} />
                      {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Full Address *</Label>
                      <Input name="address" placeholder="House No, Street Name, Area, City" value={formData.address} onChange={handleChange} className={errors.address ? 'border-destructive' : ''} />
                      {errors.address && <p className="text-[10px] text-destructive">{errors.address}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">State *</Label>
                        <Select onValueChange={(val) => handleSelect('state', val)} value={formData.state}>
                          <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {indianStates.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {errors.state && <p className="text-[10px] text-destructive">{errors.state}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Pincode *</Label>
                        <Input name="pincode" placeholder="6-digit pincode" value={formData.pincode} onChange={handleChange} className={errors.pincode ? 'border-destructive' : ''} />
                        {errors.pincode && <p className="text-[10px] text-destructive">{errors.pincode}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Card */}
                <Card className="shadow-sm border-border overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg md:text-xl">Payment Method</CardTitle>
                        <CardDescription className="text-xs">Secure UPI Payment</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup defaultValue="online" className="grid grid-cols-1">
                      <div>
                        <RadioGroupItem value="online" id="online" className="peer sr-only" />
                        <Label
                          htmlFor="online"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-primary bg-primary/[0.02] p-4 cursor-pointer transition-all h-full"
                        >
                          <ScanLine className="mb-3 h-6 w-6 text-primary" />
                          <span className="font-bold text-sm">Online (UPI QR)</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Online Payment Content */}
                    {paymentConfig && (
                      <div className="mt-6 p-4 md:p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                          <div className="space-y-2 shrink-0 text-center">
                            <div className="bg-white p-3 rounded-xl shadow-sm border inline-block">
                              <img src={paymentConfig.qrImageUrl || "/placeholder.svg"} alt="UPI QR" className="w-36 h-36 md:w-44 md:h-44 object-contain" />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Scan to Pay via any UPI App</p>
                          </div>

                          <div className="flex-1 space-y-4 w-full min-w-0">
                            <div className="space-y-1 text-center md:text-left">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payable Amount</p>
                              <p className="text-3xl md:text-4xl font-black text-secondary">₹{total.toFixed(2)}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <a href={getUPILink()} target="_blank" rel="noreferrer" className="w-full block md:hidden">
                                <Button type="button" className="w-full bg-green-600 hover:bg-green-700 h-10 shadow-sm font-bold text-xs">
                                  <Smartphone className="mr-2 h-4 w-4" /> Open UPI App
                                </Button>
                              </a>
                              <Button type="button" variant="outline" onClick={handleCopyLink} className="w-full border-primary/20 hover:bg-primary/5 h-10 text-xs font-medium">
                                {isCopied ? <><Check className="mr-2 h-3 w-3 text-green-600" /> Copied</> : <><Copy className="mr-2 h-3 w-3" /> Copy Payment Link</>}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg border border-primary/10 w-full min-w-0">
                              <span className="text-[11px] md:text-sm text-muted-foreground truncate mr-2 flex-1 min-w-0">
                                UPI: <span className="font-mono font-bold text-foreground select-all">{paymentConfig.upiId}</span>
                              </span>
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 shrink-0" onClick={() => { navigator.clipboard.writeText(paymentConfig.upiId); toast({ title: "UPI ID Copied" }); }}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 bg-white/80 p-4 rounded-xl border border-primary/20 shadow-sm">
                          <Label className="text-[10px] md:text-xs text-primary uppercase font-black tracking-widest block">Enter Transaction ID (UTR) *</Label>
                          <Input
                            name="transactionId"
                            placeholder="12-digit number from UPI app"
                            value={formData.transactionId}
                            onChange={handleChange}
                            className={`h-10 md:h-12 text-sm md:text-lg font-mono text-center md:text-left ${errors.transactionId ? 'border-destructive' : 'border-primary/20 focus:border-primary'}`}
                          />
                          {errors.transactionId ? <p className="text-[10px] text-destructive font-bold">{errors.transactionId}</p> : <p className="text-[9px] md:text-xs text-muted-foreground italic">Your order will be verified using this ID.</p>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT: Summary (Sticky & Scrollable) */}
              <div className="lg:col-span-5 xl:col-span-4 mt-4 lg:mt-12">
                <div className="lg:sticky lg:top-36">
                  <Card className="shadow-md border-border overflow-hidden flex flex-col max-h-[calc(100vh-10rem)]">
                    <CardHeader className="bg-muted/40 pb-4 shrink-0">
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>

                    {/* Scrollable Content Area */}
                    <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                      <div className="p-4 md:p-6 space-y-4">
                        {items.map((item) => (
                          <div key={item.product.id} className="flex gap-4">
                            <div className="h-14 w-14 md:h-16 md:w-16 rounded-lg border bg-muted shrink-0 overflow-hidden shadow-sm">
                              <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-semibold text-foreground line-clamp-2 leading-tight">{item.product.name}</p>
                              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Qty: {item.quantity} × ₹{item.product.price}</p>
                            </div>
                            <div className="text-xs md:text-sm font-bold text-secondary">₹{(item.product.price * item.quantity).toFixed(0)}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    {/* Footer stays at bottom of card */}
                    <CardFooter className="bg-muted/40 p-4 md:p-6 flex flex-col gap-4 border-t border-border mt-auto shrink-0">
                      <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">₹{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-green-600 font-bold">FREE</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-base md:text-lg">Total</span>
                          <span className="font-black text-xl md:text-2xl text-secondary">₹{total.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button type="submit" className="w-full text-base md:text-lg h-12 md:h-14 font-bold shadow-xl transition-all active:scale-95" size="lg" disabled={isProcessing}>
                        {isProcessing ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Processing...</> : <><CheckCircle2 className="mr-2 h-5 w-5" /> Place Order</>}
                      </Button>

                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        <span>Securely processed via encrypted gateway</span>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;