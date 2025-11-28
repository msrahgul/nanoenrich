import { Link } from 'react-router-dom';
import { Droplets, Pill, Scissors, Heart, Flower2, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const categoryData = [
  { name: 'Skincare', icon: Droplets, description: 'Natural skincare solutions' },
  { name: 'Supplements', icon: Pill, description: 'Herbal health supplements' },
  { name: 'Hair Care', icon: Scissors, description: 'Natural hair treatments' },
  { name: 'Wellness', icon: Heart, description: 'Holistic wellness products' },
  { name: 'Essential Oils', icon: Flower2, description: 'Pure aromatherapy oils' },
  { name: 'Detox', icon: Leaf, description: 'Cleansing & detox products' },
];

export function Categories() {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#5E3A86] mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Browse our wide range of natural products organized by category
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryData.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
            >
              <Card className="group h-full hover:shadow-md transition-all duration-300 hover:border-primary/50 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 group-hover:bg-[#7EC242]/10 transition-colors">
                    <category.icon className="h-6 w-6 text-[#7EC242]0." />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-[#5E3A86] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
