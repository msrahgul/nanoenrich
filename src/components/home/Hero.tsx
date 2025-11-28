import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export function Hero() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Natural wellness products"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#7EC242] mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Natural & Organic</span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Empowering Life Through{' '}
            <span className="text-[#5E3A86]">Eco-Nano Innovation</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Discover our premium collection of natural health and wellness products. 
            Where science meets nature to bring you the best in self-care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products">
              <Button variant="hero" size="xl">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="heroOutline" size="xl">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#5E3A86]">100%</p>
              <p className="text-xs text-muted-foreground">Natural</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#5E3A86]">50K+</p>
              <p className="text-xs text-muted-foreground">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#5E3A86]">4.9★</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
