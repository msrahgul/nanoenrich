import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedProducts />
      <WhyChooseUs />
    </Layout>
  );
};

export default Index;
