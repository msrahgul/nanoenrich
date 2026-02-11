import React, { useState, useEffect } from 'react';
import { Product, PaymentSettings } from '@/types';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProductTable from '@/components/admin/ProductTable';
import ProductForm from '@/components/admin/ProductForm';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { Plus, Package, Tag, LayoutDashboard, X, TrendingUp, DollarSign, Activity, ShoppingBag, Mail, Users, Settings, Smartphone, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Eye } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Navbar } from '@/components/layout/Navbar';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from '@/components/ui/use-toast';
import emailjs from '@emailjs/browser';

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

  // --- Initial Load for Settings ---
  useEffect(() => {
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

  const handleWhatsAppUpdate = (order: any) => {
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

  const handleStatusChange = async (orderId: string, newStatus: any, orderData: any) => {
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
        orderData.customer.flat,
        orderData.customer.area,
        orderData.customer.city,
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

  const handleDeleteCategory = (category: string) => {
    deleteCategory(category);
  };


  // --- Derived Data for UI ---
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stockStatus === 'in-stock').length;
  const featuredProducts = products.filter(p => p.featured).length;
  const totalCategories = categories.filter(c => c !== 'All').length;

  // Calculate total inventory value (Mock calculation for display)
  const totalValue = products.reduce((acc, curr) => acc + curr.price, 0);

  // Mock Data for Charts based on actual categories
  const categoryData = categories
    .filter(c => c !== 'All')
    .map(cat => ({
      name: cat,
      value: products.filter(p => p.category === cat).length
    }))
    .filter(item => item.value > 0);

  // Colors for Pie Chart
  const COLORS = ['#7EC242', '#5E3A86', '#FFBB28', '#FF8042', '#0088FE', '#00C49F'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/40 p-4 md:p-8">

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-secondary">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your store's performance and inventory.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {(!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) && (
              <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50">
                Cloudinary Not Configured
              </Badge>
            )}
            <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </div>

        </div>

        {/* Tabs Navigation */}
        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <TabsList className="bg-background border min-w-max flex h-auto p-1">
              <TabsTrigger value="overview" className="whitespace-nowrap data-[state=active]:bg-secondary data-[state=active]:text-white px-3 py-2 text-xs md:text-sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="whitespace-nowrap data-[state=active]:bg-secondary data-[state=active]:text-white px-3 py-2 text-xs md:text-sm">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="products" className="whitespace-nowrap data-[state=active]:bg-secondary data-[state=active]:text-white px-3 py-2 text-xs md:text-sm">
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap data-[state=active]:bg-secondary data-[state=active]:text-white px-3 py-2 text-xs md:text-sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* --- OVERVIEW TAB --- */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <Card className="bg-blue-50/30 border-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-2">
                  <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-600">Pending</CardTitle>
                  <Activity className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-black">{orders.filter(o => o.status === 'Pending').length}</div>
                  <p className="text-[9px] md:text-xs text-muted-foreground mt-1">Orders to process</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50/30 border-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-2">
                  <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-orange-600">In Transit</CardTitle>
                  <Package className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-black">{orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length}</div>
                  <p className="text-[9px] md:text-xs text-muted-foreground mt-1">Gathering & Shipping</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50/30 border-green-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-2">
                  <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-green-600">Delivered</CardTitle>
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-black">{orders.filter(o => o.status === 'Delivered').length}</div>
                  <p className="text-[9px] md:text-xs text-muted-foreground mt-1">Successfully completed</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50/30 border-red-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-2">
                  <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-red-600">Cancelled</CardTitle>
                  <X className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-black">{orders.filter(o => o.status === 'Cancelled').length}</div>
                  <p className="text-[9px] md:text-xs text-muted-foreground mt-1">Order cancellations</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/10 col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-4 pb-2">
                  <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary">Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="text-lg md:text-2xl font-black text-secondary">
                    ₹{orders
                      .filter(o => o.status !== 'Cancelled')
                      .reduce((acc, curr) => acc + curr.total, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-[9px] md:text-xs text-muted-foreground mt-1">From active orders</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Selling Products */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Based on order volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
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
                                productStats[item.product.id] = {
                                  name: item.product.name,
                                  quantity: 0,
                                  revenue: 0
                                };
                              }
                              productStats[item.product.id].quantity += item.quantity;
                              productStats[item.product.id].revenue += item.quantity * item.product.price;
                            });
                          }
                        });

                        const topProducts = Object.values(productStats)
                          .sort((a, b) => b.quantity - a.quantity)
                          .slice(0, 5);

                        if (topProducts.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">No sales data available</TableCell>
                            </TableRow>
                          );
                        }

                        return topProducts.map((prod, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{prod.name}</TableCell>
                            <TableCell className="text-right">{prod.quantity}</TableCell>
                            <TableCell className="text-right">₹{prod.revenue.toLocaleString()}</TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Category Share Chart (Kept as it's useful dynamic data) */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Category Share</CardTitle>
                  <CardDescription>Distribution of products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {categoryData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- ORDERS TAB --- */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  View and manage customer orders.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase tracking-wider">ID</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Date</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Total</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">UTR</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No orders found yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className={`${order.status === 'Cancelled' ? 'opacity-50 line-through' : ''} transition-colors hover:bg-muted/50`}>
                          <TableCell className="font-bold text-secondary">#{order.id.slice(0, 6)}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-col min-w-[120px]">
                              <span className="font-bold text-sm">{order.customer.fullName}</span>
                              <span className="text-[10px] text-muted-foreground">{order.customer.mobile}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">₹{order.total.toFixed(0)}</TableCell>
                          <TableCell className="font-mono text-[10px] select-all uppercase">
                            {order.transactionId ? order.transactionId.slice(0, 8) + "..." : '-'}
                          </TableCell>
                          <TableCell>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Select
                                defaultValue={order.status}
                                onValueChange={(val: any) => handleStatusChange(order.id, val, order)}
                                disabled={sendingEmailId === order.id}
                              >
                                <SelectTrigger className={`w-[110px] h-9 font-bold text-[10px] uppercase tracking-wide border-2 ${order.status === 'Delivered' ? 'border-green-200 text-green-700' : 'border-primary/20'}`}>
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
                            </div>
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-1 px-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                              onClick={() => handleWhatsAppUpdate(order)}
                              title="WhatsApp"
                            >
                              <Smartphone className="h-4 w-4" />
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4 text-primary" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl w-[95vw] rounded-2xl overflow-hidden no-underline opacity-100 p-0">
                                <DialogHeader className="p-6 bg-secondary/10 border-b border-secondary/10">
                                  <DialogTitle className="flex items-center gap-2 text-secondary">
                                    <ShoppingBag className="h-5 w-5" /> Order Details #{order.id.slice(0, 8)}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-6 p-6 text-left">
                                  {/* Shipping and Payment info */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-dashed p-4 rounded-xl bg-muted/30 text-sm">
                                    <div className="space-y-1">
                                      <h4 className="font-black mb-2 text-primary uppercase text-[10px] tracking-widest flex items-center gap-1.5"><Users className="h-3 w-3" /> Shipping To</h4>
                                      <p className="font-bold text-secondary">{order.customer.fullName}</p>
                                      <p className="text-xs text-muted-foreground leading-relaxed">{order.customer.flat}, {order.customer.area}, {order.customer.city} - {order.customer.pincode}</p>
                                      <div className="mt-3 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-primary/10 shadow-sm">
                                        <Smartphone className="h-3 w-3 text-secondary" />
                                        <span className="text-[11px] font-bold text-secondary">{order.customer.mobile}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1 sm:border-l sm:pl-4 pt-4 sm:pt-0">
                                      <h4 className="font-black mb-2 text-primary uppercase text-[10px] tracking-widest flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> Payment Info</h4>
                                      <p className="font-black text-2xl text-secondary">₹{order.total.toFixed(2)}</p>
                                      <div className="space-y-2 mt-2">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">UTR / Transaction ID</p>
                                        <p className="font-mono font-bold text-[11px] select-all bg-secondary/10 px-2 py-1.5 rounded-lg border border-secondary/10 inline-block w-full text-center">{order.transactionId || 'NOT PROVIDED'}</p>
                                      </div>
                                      <div className="pt-2">
                                        <Badge variant={order.status === 'Delivered' ? 'default' : 'outline'} className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase">{order.status}</Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Product List */}
                                  <div className="space-y-4">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                      <Package className="h-3.5 w-3.5" /> Items Purchased
                                      <span className="h-px flex-1 bg-muted"></span>
                                    </h4>
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                                      {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between group">
                                          <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border-2 border-muted shadow-sm group-hover:border-primary/30 transition-colors">
                                              <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="space-y-0.5">
                                              <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">{item.product.name}</p>
                                              <p className="text-[10px] text-muted-foreground font-bold">
                                                Qty: <span className="text-secondary">{item.quantity}</span> × ₹{item.product.price}
                                              </p>
                                            </div>
                                          </div>
                                          <p className="text-sm font-black text-secondary">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center mt-2 pt-6 border-t-2 border-secondary/5">
                                    <div>
                                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Grand Total</p>
                                      <p className="text-xs text-muted-foreground">Incl. GST & Shipping</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-3xl font-black text-primary tracking-tighter">₹{order.total.toFixed(2)}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- PRODUCTS & CATEGORIES TAB --- */}
          <TabsContent value="products" className="space-y-6">
            {/* Category Management Section */}
            < Card >
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>
                  Organize your products into categories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2 max-w-md">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90 text-white whitespace-nowrap">
                    Add Category
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="text-sm py-2 px-4 flex items-center gap-2 bg-card hover:bg-accent transition-colors"
                    >
                      {category}
                      {category !== 'All' && (
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                          title="Delete Category"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card >

            {/* Product Catalog Section */}
            < Card >
              <CardHeader>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>
                  Manage your products, prices, and stock status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductTable onEdit={handleEditProduct} />
              </CardContent>
            </Card >
          </TabsContent >



          {/* --- SETTINGS TAB --- */}
          < TabsContent value="settings" >
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
                <CardDescription>Setup your UPI details for customer payments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <Label>UPI ID (VPA)</Label>
                  <Input
                    placeholder="e.g. business@oksbi"
                    value={paymentSettings.upiId}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, upiId: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payee Name</Label>
                  <Input
                    placeholder="e.g. Nano Enrich Store"
                    value={paymentSettings.payeeName}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, payeeName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>QR Code Image</Label>
                  <div className="border rounded-md p-4">
                    <ImageUploadField
                      value={paymentSettings.qrImageUrl}
                      onChange={(url) => setPaymentSettings(prev => ({ ...prev, qrImageUrl: url }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Upload a clear image of your UPI QR Code.</p>
                </div>

                <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full">
                  {isSavingSettings ? 'Saving...' : 'Save Configuration'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent >
        </Tabs >

        {/* Product Form Dialog */}
        < ProductForm
          product={editingProduct}
          open={isFormOpen}
          onClose={handleCloseForm}
        />
      </div >
    </>
  );
};

export default Admin;