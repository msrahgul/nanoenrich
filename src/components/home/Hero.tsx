import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, Globe, ShieldCheck } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

/**
 * Modern "Nature-Tech" Hero Component
 * Optimized for Bamboo-based product selling with mobile visibility fixes.
 */
export function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[700px] flex flex-col overflow-hidden bg-[#fdfdfb]">

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Sustainable Bamboo Lifestyle"
          className="w-full h-full object-cover object-[75%_center] lg:object-center opacity-90"
          loading="eager"
        />

        {/* Mobile-only subtle dark overlay to make white text pop */}
        <div className="absolute inset-0 bg-black/40 lg:hidden" />

        {/* Desktop Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdfdfb] via-[#fdfdfb]/80 to-transparent hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfb] via-[#fdfdfb]/40 to-transparent lg:hidden" />
      </div>

      {/* Content Container: Uses pt-32 to clear the navbar area */}
      <div className="container relative z-10 mx-auto px-6 pt-32 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl animate-in fade-in slide-in-from-left-10 duration-1000">

          {/* Brand Tagline: White on mobile, Secondary on desktop */}
          <div className="flex items-center gap-2 mb-6">
            <span className="h-px w-8 bg-white lg:bg-secondary" />
            <span className="text-sm font-bold tracking-[0.2em] text-white lg:text-secondary uppercase">
              100% Sustainable Organic Bamboo
            </span>
          </div>

          {/* Main Headline: White/Light Emerald on mobile, Foreground/Dark Emerald on desktop */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium text-white lg:text-foreground leading-[1.1] mb-8 drop-shadow-sm lg:drop-shadow-none">
            The Art of <br />
            <span className="italic text-emerald-100 lg:text-emerald-800">Sustainable</span> Living.
          </h1>

          {/* Paragraph: Light gray on mobile for readability, muted-foreground on desktop */}
          <p className="max-w-lg text-lg md:text-xl text-neutral-100 lg:text-muted-foreground leading-relaxed mb-10 drop-shadow-sm lg:drop-shadow-none">
            Discover our curated collection of bamboo-based foods and healthcare essentials.
            Blending ancient heritage with eco-nano innovation for a healthier you and a greener planet.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/products">
              <Button size="xl" className="w-full sm:w-auto rounded-full bg-emerald-900 hover:bg-emerald-950 text-white px-10 h-16 text-lg transition-all shadow-xl shadow-emerald-900/10">
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="xl" className="w-full sm:w-auto rounded-full border-white/40 lg:border-emerald-900/20 bg-white/10 lg:bg-white/50 text-white lg:text-foreground backdrop-blur-md px-10 h-16 text-lg hover:bg-white/20 lg:hover:bg-emerald-50/50 transition-all">
                Our Process
              </Button>
            </Link>
          </div>

          {/* Horizontal Feature Bar - Now hidden on mobile, visible from 'sm' breakpoint upwards */}
          <div className="hidden sm:grid grid-cols-3 gap-8 pt-8 border-t border-emerald-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100/50">
                <Leaf className="h-5 w-5 text-emerald-700" />
              </div>
              <span className="text-sm font-semibold text-emerald-900">Eco-Friendly</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100/50">
                <Globe className="h-5 w-5 text-emerald-700" />
              </div>
              <span className="text-sm font-semibold text-emerald-900">Carbon Neutral</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100/50">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
              </div>
              <span className="text-sm font-semibold text-emerald-900">Pure Quality</span>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Text Side Decor (Desktop Only) */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden xl:flex flex-col gap-10 text-emerald-900/20 font-serif text-9xl select-none pointer-events-none">
        <span className="rotate-90 origin-center tracking-tighter">BAMBOO</span>
      </div>
    </section>
  );
}
