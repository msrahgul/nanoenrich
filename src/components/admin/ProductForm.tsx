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
    inStock: true,
    featured: false,
  });

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
        inStock: product.inStock,
        featured: product.featured || false,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        description: '',
        longDescription: '',
        category: categories[1] || '',
        image: '',
        ingredients: '',
        benefits: '',
        inStock: true,
        featured: false,
      });
    }
  }, [product, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description,
      longDescription: formData.longDescription,
      category: formData.category,
      image: formData.image || '/placeholder.svg',
      ingredients: formData.ingredients || undefined,
      benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : undefined,
      inStock: formData.inStock,
      featured: formData.featured,
    };

    if (isEditing && product) {
      updateProduct(product.id, productData);
      toast({ title: 'Success', description: 'Product updated successfully' });
    } else {
      addProduct(productData);
      toast({ title: 'Success', description: 'Product added successfully' });
    }

    onClose();
  };

  const filteredCategories = categories.filter(c => c !== 'All');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#5E3A86]">{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

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
            <div className="flex items-center gap-2">
              <Switch className="data-[state=checked]:bg-[#7EC242]"
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, inStock: checked }))}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch className="data-[state=checked]:bg-[#7EC242]"
                id="featured"
                checked={formData.featured}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#7EC242] hover:bg-[#7EC242]/90 text-white">
              {isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
