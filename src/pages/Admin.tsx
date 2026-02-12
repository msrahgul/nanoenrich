import React, { useState, useEffect } from 'react';
import { Product, Order, PaymentSettings } from '@/types';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductTable from '@/components/admin/ProductTable';
import ProductForm from '@/components/admin/ProductForm';
import ImageUploadField from '@/components/admin/ImageUploadField';
import {
  Plus, Package, LayoutDashboard, X, TrendingUp, DollarSign,
  Activity, ShoppingBag, Settings, Smartphone, Check, LogOut,
  AlertCircle, CheckCircle2, Eye, Users, Search, IndianRupee, ShieldAlert,
  UserPlus, Trash2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  collection, doc, getDoc, setDoc, onSnapshot, addDoc, deleteDoc, query, where, getDocs
} from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { db } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';
import { cn } from '@/lib/utils';

// --- CONSTANTS ---
const PAYMENT_SETTINGS_DOC = 'payment_config';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_UNIFIED = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const LOGO_URL = import.meta.env.VITE_LOGO_URL;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const Admin = () => {
  const {
    products, categories, addCategory, deleteCategory, orders, updateOrderStatus
  } = useProducts();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'admins' | 'settings'>('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [newCategory, setNewCategory] = useState('');

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiId: '',
    payeeName: '',
    qrImageUrl: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  // Admin Management State
  const [adminEmails, setAdminEmails] = useState<{ id: string, email: string }[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // --- Initial Load for Settings & Admins ---
  useEffect(() => {
    // Fetch Settings
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', PAYMENT_SETTINGS_DOC);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPaymentSettings(docSnap.data() as PaymentSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();

    // Listen for Admins
    const unsubAdmins = onSnapshot(collection(db, 'authorized_users'), (snapshot) => {
      setAdminEmails(snapshot.docs.map(doc => ({ id: doc.id, email: doc.id })));
    });

    return () => unsubAdmins();
  }, []);

  // --- Handlers ---
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', PAYMENT_SETTINGS_DOC), paymentSettings);
      toast({ title: "Settings Saved", description: "Payment configuration updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleWhatsAppUpdate = (order: Order) => {
    let message = "";

    switch (order.status) {
      case 'Pending':
        message = `Hello ${order.customer.fullName}, thank you for your order #${order.id.slice(0, 6)} at Nano Enrich! We have received your order and it is currently pending. We will start processing it soon. Thank you for your patience!`;
        break;
      case 'Processing':
        message = `Hi ${order.customer.fullName}, your order #${order.id.slice(0, 6)} is now being processed. We're getting your items ready for shipment! We'll notify you once it's on its way.`;
        break;
      case 'Shipped':
        message = `Great news ${order.customer.fullName}! Your order #${order.id.slice(0, 6)} has been shipped and is on its way to you. It should be with you shortly!`;
        break;
      case 'Delivered':
        message = `Hi ${order.customer.fullName}, your order #${order.id.slice(0, 6)} has been delivered! We hope you enjoy your Nano Enrich products. Thank you for shopping with us!`;
        break;
      case 'Cancelled':
        message = `Hi ${order.customer.fullName}, we're sorry to inform you that your order #${order.id.slice(0, 6)} has been cancelled. If you have any questions, please feel free to reach out to us.`;
        break;
      default:
        message = `Hello ${order.customer.fullName}, update regarding your order #${order.id.slice(0, 6)}. Current Status: ${order.status}.`;
    }

    const url = `https://wa.me/91${order.customer.mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status'], orderData: Order) => {
    // 1. Update Database
    await updateOrderStatus(orderId, newStatus);

    // 2. Define Content based on Status
    let statusTitle = "";
    let statusMessage = "";
    let highlightInfo = "";

    switch (newStatus) {
      case 'Processing':
        statusTitle = `Order #${orderId} is Processing`;
        statusMessage = "We have verified your payment! Your items are now being gathered and packed with care.";
        highlightInfo = "Current Status: Processing";
        break;
      case 'Shipped':
        statusTitle = `Order #${orderId} Shipped! 🚚`;
        statusMessage = "Great news! Your package has left our facility and is on its way to you.";
        highlightInfo = "Current Status: Shipped (In Transit)";
        break;
      case 'Delivered':
        statusTitle = `Order #${orderId} Delivered ✅`;
        statusMessage = "Your package has been delivered. We hope you enjoy your purchase! Thank you for choosing NanoEnrich.";
        highlightInfo = "Current Status: Delivered";
        break;
      case 'Cancelled':
        statusTitle = `Order #${orderId} Cancelled ❌`;
        statusMessage = "Your order has been cancelled. If you have paid, the amount will be refunded to your source account shortly.";
        highlightInfo = "Current Status: Cancelled";
        break;
      default:
        return;
    }

    setSendingEmailId(orderId);

    try {
      // 3. Generate Items HTML
      const itemsListHTML = orderData.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">${item.product.name}</td>
          <td align="center">x${item.quantity}</td>
          <td align="right">₹${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>`).join('');

      const cleanAddress = [
        orderData.customer.address,
        `${orderData.customer.state}-${orderData.customer.pincode}`
      ].filter(Boolean).join(', ');

      // 4. Send Unified Email
      const templateParams = {
        to_email: orderData.customer.email,
        to_name: orderData.customer.fullName,
        logo_url: LOGO_URL,
        website_link: window.location.origin,

        // Reply To: Admin's Email
        reply_to: ADMIN_EMAIL,

        // Dynamic Content
        subject: `Update: ${statusTitle}`,
        status_title: statusTitle,
        status_message: statusMessage,
        highlight_info: highlightInfo,

        // Data
        order_items: itemsListHTML,
        total: orderData.total.toFixed(2),
        customer_address: cleanAddress,
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_UNIFIED, templateParams, EMAILJS_PUBLIC_KEY);

      // 5. Open WhatsApp Manually
      const waMessage = `Hello ${orderData.customer.fullName}!\n\n${statusMessage}\n\nOrder ID: #${orderId}\nStatus: ${newStatus}\n\nThank you for choosing NanoEnrich!`;
      const waUrl = `https://wa.me/91${orderData.customer.mobile}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank');

      toast({ title: "Email Sent & WA Opened", description: `Customer notified of '${newStatus}' status.` });

    } catch (error) {
      console.error("Email Failed", error);
      toast({ title: "Email Failed", description: "Status updated, but email notification failed.", variant: "destructive" });
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    if (!newAdminEmail.includes('@')) {
      toast({ title: "Invalid Email", variant: "destructive" });
      return;
    }

    setIsAddingAdmin(true);
    try {
      const emailId = newAdminEmail.trim().toLowerCase();
      // Use document ID for the email
      await setDoc(doc(db, 'authorized_users', emailId), {
        role: 'admin',
        addedAt: new Date().toISOString()
      });

      setNewAdminEmail('');
      toast({ title: "Admin Added", description: `${emailId} is now authorized.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add admin", variant: "destructive" });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (email.toLowerCase() === 'nanoenrich@gmail.com') {
      toast({ title: "Restricted", description: "Default admin cannot be removed.", variant: "destructive" });
      return;
    }

    try {
      await deleteDoc(doc(db, 'authorized_users', id));
      toast({ title: "Admin Removed" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  // --- Derived Data for Charts ---
  const categoryData = categories
    .filter(c => c !== 'All')
    .map(cat => ({
      name: cat,
      value: products.filter(p => p.category === cat).length
    }))
    .filter(item => item.value > 0);

  const COLORS = ['#7EC242', '#5E3A86', '#FFBB28', '#FF8042', '#0088FE', '#00C49F'];

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${orders.filter(o => o.status !== 'Cancelled').reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      description: "From active orders"
    },
    {
      title: "Active Orders",
      value: orders.filter(o => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped').length,
      icon: ShoppingBag,
      color: "text-blue-600",
      description: "To be delivered"
    },
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-purple-600",
      description: "Items in catalog"
    },
    {
      title: "Out of Stock",
      value: products.filter(p => p.stockStatus === 'out-of-stock').length,
      icon: AlertCircle,
      color: "text-red-600",
      description: "Requires refill"
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* --- DEDICATED ADMIN SIDEBAR --- */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col fixed h-full z-20 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
            NanoEnrich <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-xs">Admin Page</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className={cn(
              "w-full justify-start gap-3 transition-all",
              activeTab === 'overview' ? "bg-white/10 text-white shadow-inner" : "text-emerald-100 hover:bg-white/5"
            )}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full justify-start gap-3 transition-all",
              activeTab === 'orders' ? "bg-white/10 text-white shadow-inner" : "text-emerald-100 hover:bg-white/5"
            )}
          >
            <ShoppingBag className="h-4 w-4" /> Orders
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="ml-auto bg-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'Pending').length}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "w-full justify-start gap-3 transition-all",
              activeTab === 'inventory' ? "bg-white/10 text-white shadow-inner" : "text-emerald-100 hover:bg-white/5"
            )}
          >
            <Package className="h-4 w-4" /> Inventory
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('admins')}
            className={cn(
              "w-full justify-start gap-3 transition-all",
              activeTab === 'admins' ? "bg-white/10 text-white shadow-inner" : "text-emerald-100 hover:bg-white/5"
            )}
          >
            <Users className="h-4 w-4" /> Admins
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full justify-start gap-3 transition-all",
              activeTab === 'settings' ? "bg-white/10 text-white shadow-inner" : "text-emerald-100 hover:bg-white/5"
            )}
          >
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="w-full justify-start gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
              {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
            </h2>
            <p className="text-xs text-slate-500">Welcome back to NanoEnrich Management Portal.</p>
          </div>
          {activeTab === 'inventory' && (
            <Button onClick={handleAddProduct} className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/10 h-9">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </header>

        <div className="p-8">
          {/* --- TAB CONTENT: OVERVIEW --- */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{stat.description}</p>
                      </div>
                      <div className={cn("p-3 rounded-2xl bg-slate-50", stat.color)}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* Top Sellers Table */}
                <Card className="lg:col-span-4 border-none shadow-sm h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top Selling Products</CardTitle>
                    <CardDescription>Based on active order volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent uppercase text-[10px] tracking-widest font-bold">
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Units</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
                          orders.forEach(order => {
                            if (order.status !== 'Cancelled') {
                              order.items.forEach(item => {
                                if (!productStats[item.product.id]) {
                                  productStats[item.product.id] = { name: item.product.name, quantity: 0, revenue: 0 };
                                }
                                productStats[item.product.id].quantity += item.quantity;
                                productStats[item.product.id].revenue += item.quantity * item.product.price;
                              });
                            }
                          });
                          const topProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
                          return topProducts.length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-400 text-sm italic">No sales data recorded</TableCell></TableRow>
                          ) : topProducts.map((prod, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-bold text-slate-800 text-sm">{prod.name}</TableCell>
                              <TableCell className="text-right font-mono text-emerald-600 font-bold">{prod.quantity}</TableCell>
                              <TableCell className="text-right font-black text-slate-900">₹{prod.revenue.toLocaleString()}</TableCell>
                            </TableRow>
                          ));
                        })()}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Category Share Chart */}
                <Card className="lg:col-span-3 border-none shadow-sm h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Category Distribution</CardTitle>
                    <CardDescription>Stock share across types</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-4">
                      {categoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span>{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT: ORDERS --- */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-6">
                  <div>
                    <CardTitle className="text-xl">Customer Orders</CardTitle>
                    <CardDescription>View, update status, and notify customers.</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search orders..." className="pl-9 h-9 w-64 bg-slate-50 border-slate-200" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-slate-50/50">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Order ID</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Customer</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">UTR / ID</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">Management</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-20 text-slate-400 italic">No orders found 📦</TableCell></TableRow>
                      ) : orders.map((order) => (
                        <TableRow key={order.id} className={cn("transition-colors hover:bg-slate-50 group", order.status === 'Cancelled' && "opacity-50")}>
                          <TableCell className="font-black text-emerald-700 pl-6">#{order.id}</TableCell>
                          <TableCell className="text-xs font-medium text-slate-500">{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-sm">{order.customer.fullName}</span>
                              <span className="text-[10px] font-bold text-slate-500">{order.customer.mobile}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-black text-slate-900">₹{order.total.toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-[10px] font-black uppercase text-slate-500 truncate max-w-[80px]">
                            {order.transactionId || '-'}
                          </TableCell>
                          <TableCell>
                            <Select
                              defaultValue={order.status}
                              onValueChange={(val: any) => handleStatusChange(order.id, val, order)}
                              disabled={sendingEmailId === order.id}
                            >
                              <SelectTrigger className={cn(
                                "w-[120px] h-8 text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                                order.status === 'Delivered' ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                                  order.status === 'Cancelled' ? "border-red-100 bg-red-50 text-red-600" :
                                    "border-slate-100 bg-white"
                              )}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleWhatsAppUpdate(order)} title="WhatsApp Update"
                              >
                                <Smartphone className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                                  <div className="bg-emerald-950 p-6 text-white flex justify-between items-center">
                                    <DialogTitle className="text-xl font-black italic tracking-tighter">Order Snapshot <span className="text-emerald-400 not-italic">#{order.id}</span></DialogTitle>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black uppercase text-[10px] tracking-widest">{order.status}</Badge>
                                  </div>
                                  <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                      <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Users className="h-3 w-3" /> Shipping Contact</h4>
                                        <div className="space-y-1">
                                          <p className="font-black text-slate-900 leading-tight">{order.customer.fullName}</p>
                                          <p className="text-xs text-slate-500">{order.customer.email}</p>
                                          <p className="font-bold text-emerald-700 text-xs mt-1">{order.customer.mobile}</p>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Smartphone className="h-3 w-3" /> Delivery At</h4>
                                        <p className="text-xs font-bold text-slate-600 leading-relaxed capitalize">{order.customer.address}, {order.customer.state} - {order.customer.pincode}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 underline underline-offset-4 decoration-emerald-200">Items Purchased</h4>
                                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                              <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                              <div>
                                                <p className="text-xs font-black text-slate-900">{item.product.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400">QTY: {item.quantity} × ₹{item.product.price}</p>
                                              </div>
                                            </div>
                                            <p className="text-xs font-black text-emerald-800">₹{(item.quantity * item.product.price).toLocaleString()}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                      <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Transaction Value</p>
                                        <p className="text-[9px] font-bold text-emerald-600 italic mt-0.5">Payment Verified via UTR: {order.transactionId || 'Manual'}</p>
                                      </div>
                                      <p className="text-3xl font-black text-slate-900 tracking-tightest">₹{order.total.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* --- TAB CONTENT: INVENTORY --- */}
          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Category List Side */}
                <Card className="lg:col-span-1 border-none shadow-sm h-fit sticky top-28">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Categories</CardTitle>
                    <CardDescription>Manage group headings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Input
                        placeholder="Add new..."
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                        className="h-9 text-xs border-slate-200"
                      />
                      <Button onClick={handleAddCategory} size="sm" className="w-full bg-slate-900 h-9 font-bold text-[11px] uppercase tracking-widest">Add</Button>
                    </div>
                    <div className="space-y-1 mt-6">
                      {categories.map(cat => (
                        <div key={cat} className="group flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                          <span className="text-xs font-bold text-slate-700">{cat}</span>
                          {cat !== 'All' && (
                            <button onClick={() => deleteCategory(cat)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded-md transition-all">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Main Product Table */}
                <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden">
                  <div className="p-0">
                    <ProductTable onEdit={handleEditProduct} />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT: ADMINS --- */}
          {activeTab === 'admins' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-700">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Admin Access Control</CardTitle>
                      <CardDescription>Manage who can access this dashboard via Google Login.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1 relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Authorized Gmail Address..."
                        className="pl-9 h-12 bg-white border-slate-200 rounded-xl"
                        value={newAdminEmail}
                        onChange={e => setNewAdminEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
                      />
                    </div>
                    <Button
                      onClick={handleAddAdmin}
                      disabled={isAddingAdmin}
                      className="bg-emerald-700 hover:bg-emerald-800 h-12 px-6 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-900/10"
                    >
                      Grant Access
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Authorized Administrators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Always show the default if not in list */}
                      {!adminEmails.some(a => a.email === 'nanoenrich@gmail.com') && (
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-emerald-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">NE</div>
                            <span className="text-sm font-black text-slate-800">nanoenrich@gmail.com</span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-none pointer-events-none">OWNER</Badge>
                        </div>
                      )}
                      {adminEmails.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                              {admin.email.substring(0, 2)}
                            </div>
                            <span className="text-sm font-black text-slate-800">{admin.email}</span>
                          </div>
                          {admin.email === 'nanoenrich@gmail.com' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-none">OWNER</Badge>
                          ) : (
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-amber-900">Security Note</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Admins added here must use their official Google accounts to sign in. The default owner account <b>(nanoenrich@gmail.com)</b> has permanent access and cannot be modified to prevent accidental lockout.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT: SETTINGS --- */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="max-w-2xl border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-700">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Payment Gateway Settings</CardTitle>
                      <CardDescription>Configure your UPI credentials for order transactions.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500 pl-1">Merchant UPI ID (VPA)</Label>
                      <Input
                        placeholder="e.g. business@oksbi"
                        value={paymentSettings.upiId}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, upiId: e.target.value }))}
                        className="border-slate-200 h-11 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500 pl-1">Display/Payee Name</Label>
                      <Input
                        placeholder="e.g. Nano Enrich Store"
                        value={paymentSettings.payeeName}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, payeeName: e.target.value }))}
                        className="border-slate-200 h-11 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="uppercase text-[10px] font-black tracking-widest text-slate-500 pl-1">Collection QR Code</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-200 transition-all">
                      <ImageUploadField
                        value={paymentSettings.qrImageUrl}
                        onChange={(url) => setPaymentSettings(prev => ({ ...prev, qrImageUrl: url }))}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic text-center">Supported formats: JPG, PNG. Recommended size: 500x500px.</p>
                  </div>

                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-900/10 transition-all hover:-translate-y-0.5"
                  >
                    {isSavingSettings ? 'Pushing Changes...' : 'Synchronize Config'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* --- GLOBAL COMPONENTS --- */}
        <ProductForm
          product={editingProduct}
          open={isFormOpen}
          onClose={handleCloseForm}
        />
      </main>
    </div>
  );
};

export default Admin;