import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export function Hero() {
  return (
    <section className="relative min-h-[500px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Natural wellness products"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/30 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:hidden" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-12">
        <div className="max-w-2xl mx-auto md:mx-0 text-center md:text-left">

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 md:mb-6">
            Empowering Life Through{' '}
            <span className="text-secondary block md:inline mt-1 md:mt-0">Eco-Nano Innovation</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Discover our premium collection of Bamboo Salt based Food, Nutraceuticals, and Healthcare products.
            Where tradition meets nano-technology for your well-being.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full sm:w-auto">
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto bg-background/50 backdrop-blur-sm">
                Learn More
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
