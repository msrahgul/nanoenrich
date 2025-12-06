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
    <section className="py-16 lg:py-24 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Why Choose NanoEnrich?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Experience the healing power of nature with our bamboo salt innovations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
