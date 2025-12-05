import React from 'react';
import { Product } from '@/types';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductTableProps {
  onEdit: (product: Product) => void;
}

const ProductTable = ({ onEdit }: ProductTableProps) => {
  const { products, deleteProduct } = useProducts();
  const { toast } = useToast();

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    toast({
      title: 'Product Deleted',
      description: `"${name}" has been removed`,
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Featured</TableHead>
            <TableHead className="text-right w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No products found. Add your first product!
              </TableCell>
            </TableRow>
          ) : (
            products.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-secondary">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground text-sm line-through ml-2">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.inStock ? 'default' : 'destructive'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {product.featured && (
                    <Star className="h-4 w-4 text-primary fill-primary mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id, product.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
