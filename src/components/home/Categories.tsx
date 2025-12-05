import { Link } from 'react-router-dom';
import { Droplets, Pill, Heart, Sparkles, Utensils, Smile } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const categoryData = [
  { name: 'Bamboo Salt', icon: Sparkles, description: 'Premium roasted bamboo salt' },
  { name: 'Nutraceuticals', icon: Pill, description: 'Health supplements & capsules' },
  { name: 'Healthy Food', icon: Utensils, description: 'Nutritious & natural foods' },
  { name: 'Skincare', icon: Droplets, description: 'Natural skincare solutions' },
  { name: 'Personal Care', icon: Smile, description: 'Daily hygiene essentials' },
  { name: 'Wellness', icon: Heart, description: 'Holistic wellness products' },
];

export function Categories() {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-secondary mb-3">
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
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors">
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
