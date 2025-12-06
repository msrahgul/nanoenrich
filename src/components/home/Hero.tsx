import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Empowering Life Through{' '}
            <span className="text-secondary">Eco-Nano Innovation</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Discover our premium collection of Bamboo Salt based Food, Nutraceuticals, and Healthcare products.
            Where tradition meets nano-technology for your well-being.
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


        </div>
      </div>
    </section>
  );
}
