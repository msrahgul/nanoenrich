import { Button } from '@/components/ui/button';
import { useProducts } from '@/context/ProductContext';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { categories } = useProducts();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(category)}
          className={cn(
            "transition-all border-secondary",
            selectedCategory === category
              ? "bg-secondary hover:bg-secondary/90 text-white shadow-md"
              : "bg-transparent text-secondary hover:bg-secondary/10"
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
