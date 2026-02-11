import { Shield, Truck, Award, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Premium Bamboo Salt',
    description: 'Sourced from the finest bamboo and roasted to perfection for maximum health benefits.',
  },
  {
    icon: Shield,
    title: '100% Natural & Pure',
    description: 'Free from additives and harmful chemicals, ensuring the highest quality for your health.',
  },
  {
    icon: Award,
    title: 'Quality Certified',
    description: 'Rigorously tested and certified to meet the highest standards of safety and efficacy.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-12 lg:py-24 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-3">
            Why Choose NanoEnrich?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto px-4">
            Experience the healing power of nature with our bamboo salt innovations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, idx) => (
            <div key={feature.title} className="text-center px-4 md:px-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110 duration-300">
                <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
