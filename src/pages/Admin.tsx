import React, { useState } from 'react';
import { Product } from '@/types';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProductTable from '@/components/admin/ProductTable';
import ProductForm from '@/components/admin/ProductForm';
import { Plus, Package, Tag, LayoutDashboard, X, TrendingUp, DollarSign, Activity, ShoppingBag, Mail, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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

const Admin = () => {
  const {
    products, categories, addCategory, deleteCategory, orders, updateOrderStatus,
    subscribers, isNewsletterEnabled, toggleNewsletterFeature
  } = useProducts();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [newCategory, setNewCategory] = useState('');

  // --- Handlers ---
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
      toast({ title: 'Category Added', description: `"${newCategory}" category has been added` });
    }
  };

  const handleDeleteCategory = (category: string) => {
    deleteCategory(category);
    toast({ title: 'Category Deleted', description: `"${category}" category has been removed` });
  };

  // --- Derived Data for UI ---
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-secondary">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your store's performance and inventory.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-background border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Products & Categories
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
              <Mail className="h-4 w-4 mr-2" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          {/* --- OVERVIEW TAB --- */}
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Cards */}
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Pending').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders waiting to be processed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In-Transit Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Processing & Shipped
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Delivered').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Successfully completed orders
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
                  <X className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Cancelled').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders cancelled by customers/admin
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{orders
                      .filter(o => o.status !== 'Cancelled')
                      .reduce((acc, curr) => acc + curr.total, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {orders.filter(o => o.status !== 'Cancelled').length} completed/active orders
                  </p>
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className={order.status === 'Cancelled' ? 'opacity-50 line-through decoration-slate-500' : ''}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{order.customer.fullName}</span>
                              <span className="text-xs text-muted-foreground">{order.customer.city}</span>
                            </div>
                          </TableCell>
                          <TableCell>₹{order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Select
                                defaultValue={order.status}
                                onValueChange={(val: any) => updateOrderStatus(order.id, val)}
                              >
                                <SelectTrigger className="w-[120px] h-8">
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
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4 text-primary" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl no-underline opacity-100">
                                <DialogHeader>
                                  <DialogTitle>Order Details #{order.id}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-6 py-4 text-left">
                                  {/* Customer Details */}
                                  <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Shipping To:</h4>
                                      <p className="text-sm">{order.customer.fullName}</p>
                                      <p className="text-sm">{order.customer.flat}, {order.customer.area}</p>
                                      <p className="text-sm">{order.customer.landmark}</p>
                                      <p className="text-sm">{order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Contact:</h4>
                                      <p className="text-sm">Mobile: {order.customer.mobile}</p>
                                      <p className="text-sm">Email: {order.customer.email || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {/* Product List */}
                                  <div>
                                    <h4 className="font-semibold text-sm mb-3">Items Purchased:</h4>
                                    <div className="space-y-3">
                                      {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                              {/* Fallback image logic if needed */}
                                              <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">{item.product.name}</p>
                                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                          </div>
                                          <p className="text-sm font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                      <span className="font-bold">Total Amount</span>
                                      <span className="font-bold text-lg text-primary">₹{order.total.toFixed(2)}</span>
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
            <Card>
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
            </Card>

            {/* Product Catalog Section */}
            <Card>
              <CardHeader>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>
                  Manage your products, prices, and stock status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductTable onEdit={handleEditProduct} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- NEWSLETTER TAB --- */}
          <TabsContent value="newsletter">
            <div className="grid gap-4">
              {/* Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Popup Settings
                  </CardTitle>
                  <CardDescription>Control the visibility of the newsletter popup on your website.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Newsletter Popup</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, new visitors will see a popup asking for their email.
                    </p>
                  </div>
                  <Switch
                    checked={isNewsletterEnabled}
                    onCheckedChange={toggleNewsletterFeature}
                  />
                </CardContent>
              </Card>

              {/* Subscribers List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Subscribers ({subscribers.length})
                  </CardTitle>
                  <CardDescription>List of customers who have subscribed to your newsletter.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Date Subscribed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                            No subscribers yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscribers.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.email}</TableCell>
                            <TableCell className="text-right">
                              {new Date(sub.date).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Form Dialog */}
        <ProductForm
          product={editingProduct}
          open={isFormOpen}
          onClose={handleCloseForm}
        />
      </div>
    </>
  );
};

export default Admin;