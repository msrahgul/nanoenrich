import { Product } from '@/types';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';

export const categories = [
  'All',
  'Skincare',
  'Supplements',
  'Hair Care',
  'Wellness',
  'Essential Oils',
  'Detox',
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Face Cleanser',
    price: 899,
    originalPrice: 1199,
    description: 'Gentle, natural cleanser for all skin types',
    longDescription: 'Our Organic Face Cleanser is formulated with plant-based ingredients to gently remove impurities while maintaining your skin\'s natural moisture balance. Perfect for daily use, it leaves your skin feeling fresh, clean, and rejuvenated without stripping away essential oils.',
    category: 'Skincare',
    image: product1,
    ingredients: 'Aloe Vera, Green Tea Extract, Vitamin E, Chamomile, Jojoba Oil',
    benefits: [
      'Removes dirt and impurities gently',
      'Maintains natural moisture balance',
      'Suitable for sensitive skin',
      'Paraben and sulfate free',
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Wellness Herbal Capsules',
    price: 1299,
    originalPrice: 1599,
    description: 'Natural supplement for daily wellness',
    longDescription: 'Boost your immunity and overall wellness with our premium herbal capsules. Made from carefully selected herbs and natural ingredients, these capsules support your body\'s natural defense mechanisms and promote vitality throughout the day.',
    category: 'Supplements',
    image: product2,
    ingredients: 'Ashwagandha, Turmeric, Ginger, Black Pepper, Tulsi',
    benefits: [
      'Boosts immunity naturally',
      'Supports energy and vitality',
      'Reduces stress and fatigue',
      '100% vegetarian capsules',
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Pure Essential Oil Blend',
    price: 749,
    description: 'Aromatherapy blend for relaxation',
    longDescription: 'Experience the calming power of nature with our Pure Essential Oil Blend. This carefully crafted combination of therapeutic-grade essential oils promotes relaxation, reduces stress, and creates a serene atmosphere in your home or workspace.',
    category: 'Essential Oils',
    image: product3,
    ingredients: 'Lavender, Eucalyptus, Tea Tree, Peppermint, Lemongrass',
    benefits: [
      'Promotes relaxation and calm',
      'Natural stress relief',
      'Improves sleep quality',
      'Purifies the air naturally',
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Hair Growth Serum',
    price: 1499,
    originalPrice: 1899,
    description: 'Advanced formula for stronger hair',
    longDescription: 'Transform your hair with our scientifically formulated Hair Growth Serum. Enriched with natural extracts and essential nutrients, this serum penetrates deep into the scalp to strengthen hair follicles, reduce hair fall, and promote healthy, lustrous hair growth.',
    category: 'Hair Care',
    image: product4,
    ingredients: 'Biotin, Argan Oil, Rosemary Extract, Caffeine, Keratin',
    benefits: [
      'Reduces hair fall significantly',
      'Strengthens hair from roots',
      'Promotes new hair growth',
      'Adds natural shine and volume',
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Nourishing Body Lotion',
    price: 649,
    description: 'Deep moisturizing formula for soft skin',
    longDescription: 'Indulge your skin with our luxurious Nourishing Body Lotion. This rich, fast-absorbing formula provides 24-hour hydration while nourishing your skin with natural botanical extracts. Perfect for all skin types, it leaves your skin silky smooth and delicately fragranced.',
    category: 'Skincare',
    image: product5,
    ingredients: 'Shea Butter, Coconut Oil, Almond Oil, Vitamin E, Rose Extract',
    benefits: [
      '24-hour deep moisturization',
      'Non-greasy, fast-absorbing',
      'Suitable for all skin types',
      'Natural botanical fragrance',
    ],
    inStock: true,
  },
  {
    id: '6',
    name: 'Premium Detox Tea',
    price: 599,
    originalPrice: 799,
    description: 'Natural blend for cleansing and detox',
    longDescription: 'Cleanse your body naturally with our Premium Detox Tea. This expertly blended herbal tea combines powerful detoxifying herbs to help eliminate toxins, boost metabolism, and support digestive health. Enjoy a cup daily for optimal wellness.',
    category: 'Detox',
    image: product6,
    ingredients: 'Green Tea, Dandelion Root, Ginger, Lemon Peel, Fennel Seeds',
    benefits: [
      'Natural body detoxification',
      'Boosts metabolism',
      'Supports digestive health',
      'Caffeine-free and natural',
    ],
    inStock: true,
    featured: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All') return products;
  return products.filter(p => p.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.featured);
};
