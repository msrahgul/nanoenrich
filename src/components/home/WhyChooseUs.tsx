import { Shield, Truck, Award, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: '100% Natural',
    description: 'All our products are made from pure, natural ingredients with no harmful chemicals.',
  },
  {
    icon: Award,
    title: 'Quality Certified',
    description: 'Every product undergoes rigorous quality testing and certification.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free shipping on orders above ₹999 with quick delivery across India.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer Support',
    description: '24/7 customer support to help you with any questions or concerns.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 lg:py-24 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Why Choose NatureWell?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're committed to bringing you the best natural wellness products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#7EC242]/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-[#7EC242]" />
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
