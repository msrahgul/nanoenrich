import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ImageUploadField from './ImageUploadField';

interface ProductFormProps {
  product?: Product;
  open: boolean;
  onClose: () => void;
}

const ProductForm = ({ product, open, onClose }: ProductFormProps) => {
  const { categories, addProduct, updateProduct } = useProducts();
  const { toast } = useToast();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    longDescription: '',
    category: '',
    image: '',
    ingredients: '',
    benefits: '',
    stockStatus: 'in-stock' as 'in-stock' | 'out-of-stock' | 'to-be-launched',
    featured: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        description: product.description,
        longDescription: product.longDescription,
        category: product.category,
        image: product.image,
        ingredients: product.ingredients || '',
        benefits: product.benefits?.join('\n') || '',
        stockStatus: product.stockStatus,
        featured: product.featured || false,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        description: '',
        longDescription: '',
        category: categories.find(c => c !== 'All') || '',
        image: '',
        ingredients: '',
        benefits: '',
        stockStatus: 'in-stock',
        featured: false,
      });
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Name, Price, Category)',
        variant: 'destructive',
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid numeric price',
        variant: 'destructive',
      });
      return;
    }

    const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : undefined;

    const productData = {
      name: formData.name,
      price: price,
      originalPrice: originalPrice,


      description: formData.description,
      longDescription: formData.longDescription,
      category: formData.category,
      image: formData.image || '/placeholder.svg',
      ingredients: formData.ingredients || undefined,
      benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : undefined,
      stockStatus: formData.stockStatus,
      featured: formData.featured,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (error) {
      // Error is handled by context toast
      console.error("Form Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const filteredCategories = categories.filter(c => c !== 'All');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-secondary">{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (₹)</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={e => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                placeholder="1299"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief product description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Long Description</Label>
            <Textarea
              id="longDescription"
              value={formData.longDescription}
              onChange={e => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
              placeholder="Detailed product description"
              rows={3}
            />
          </div>

          <ImageUploadField
            value={formData.image}
            onChange={url => setFormData(prev => ({ ...prev, image: url }))}
          />


          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Input
              id="ingredients"
              value={formData.ingredients}
              onChange={e => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              placeholder="Ingredient 1, Ingredient 2, ..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (one per line)</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={e => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
              placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-2">
              <Label htmlFor="stockStatus">Inventory Status *</Label>
              <Select
                value={formData.stockStatus}
                onValueChange={value => setFormData(prev => ({ ...prev, stockStatus: value as any }))}
              >
                <SelectTrigger id="stockStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="to-be-launched">To be Launched</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch className="data-[state=checked]:bg-primary"
                id="featured"
                checked={formData.featured}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
