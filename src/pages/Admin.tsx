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
import { Plus, Package, Tag, LayoutDashboard, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { products, categories, addCategory, deleteCategory } = useProducts();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [newCategory, setNewCategory] = useState('');

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

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const featuredProducts = products.filter(p => p.featured).length;
  const totalCategories = categories.filter(c => c !== 'All').length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage your products and categories</p>
            </div>
            <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{inStockProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Package className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featuredProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
                <CardDescription>
                  Manage your product catalog. Click edit to modify or delete to remove.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductTable onEdit={handleEditProduct} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage product categories. Note: "All" category cannot be deleted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90 text-white">Add Category</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={category === 'All' ? 'secondary' : 'outline'}
                      className="text-sm py-1.5 px-3"
                    >
                      {category}
                      {category !== 'All' && (
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProductForm
        product={editingProduct}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
};

export default Admin;
