import { Product } from '@/types';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';

export const categories = [
  'All',
  'Bamboo Salt',
  'Nutraceuticals',
  'Healthy Food',
  'Skincare',
  'Personal Care',
  'Wellness',
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Bamboo Salt (9x Roasted)',
    price: 2499,
    originalPrice: 2999,
    description: 'Our Premium Bamboo Salt is roasted 9 times in bamboo pillars sealed with red clay. This traditional process eliminates toxins and infuses the salt with essential minerals. Known for its powerful antioxidant and alkalizing properties, it supports digestion, oral health, and overall immunity.',
    category: 'Bamboo Salt',
    image: product1,
    ingredients: '100% Pure Bamboo Salt',
    benefits: [
      'Rich in essential minerals',
      'High alkaline content (pH 10+)',
      'Powerful antioxidant properties',
      'Supports digestive health',
    ],
    stockStatus: 'in-stock',
    featured: true,
  },
  {
    id: '2',
    name: 'Bamboo Salt Digestive Capsules',
    price: 1299,
    originalPrice: 1599,
    description: 'These capsules combine the benefits of bamboo salt with digestive herbs to promote gut health. They help neutralize excess acid, relieve bloating, and support nutrient absorption. A convenient way to incorporate bamboo salt into your daily routine.',
    category: 'Nutraceuticals',
    image: product2,
    ingredients: 'Bamboo Salt, Ginger Extract, Probiotics, Peppermint',
    benefits: [
      'Relieves acidity and bloating',
      'Promotes healthy gut flora',
      'Enhances nutrient absorption',
      'Natural detox support',
    ],
    stockStatus: 'in-stock',
    featured: true,
  },
  {
    id: '3',
    name: 'Bamboo Salt Toothpaste',
    price: 349,
    description: 'Experience the cleaning power of bamboo salt with our natural toothpaste. It helps fight plaque, prevents gum disease, and freshens breath without harsh chemicals or fluoride. Gentle on enamel yet effective against bacteria.',
    category: 'Personal Care',
    image: product3,
    ingredients: 'Bamboo Salt, Xylitol, Mint Oil, Green Tea Extract',
    benefits: [
      'Strengthens gums and teeth',
      'Fights bacteria naturally',
      'Prevents bad breath',
      'Fluoride-free formula',
    ],
    stockStatus: 'in-stock',
    featured: true,
  },
  {
    id: '4',
    name: 'Roasted Bamboo Salt Cooking Salt',
    price: 499,
    originalPrice: 699,
    description: 'Upgrade your kitchen with our 3-times roasted Bamboo Salt. It adds a rich, savory flavor to your dishes while providing essential minerals. A healthier alternative to regular table salt, perfect for seasoning, marinades, and finishing.',
    category: 'Healthy Food',
    image: product4,
    ingredients: '100% Roasted Bamboo Salt',
    benefits: [
      'Rich mineral profile',
      'Lower sodium content than table salt',
      'Enhances natural food flavors',
      'No anti-caking agents',
    ],
    stockStatus: 'in-stock',
    featured: true,
  },
  {
    id: '5',
    name: 'Bamboo Salt Facial Mist',
    price: 899,
    description: 'Refresh and revitalize your skin with our Bamboo Salt Facial Mist. Infused with mineral-rich bamboo salt water, it hydrates, soothes inflammation, and balances skin pH. Perfect for a mid-day pick-me-up or as a toner in your skincare routine.',
    category: 'Skincare',
    image: product5,
    ingredients: 'Bamboo Salt Water, Rose Water, Aloe Vera, Glycerin',
    benefits: [
      'Instantly hydrates and refreshes',
      'Soothes irritated skin',
      'Balances skin pH',
      'Mineral-rich nourishment',
    ],
    stockStatus: 'in-stock',
  },
  {
    id: '6',
    name: 'Bamboo Salt Detox Tea',
    price: 599,
    originalPrice: 799,
    description: 'A unique blend of detoxifying herbs and a pinch of bamboo salt to support your body\'s natural cleansing processes. This tea aids in hydration, electrolyte balance, and elimination of toxins, leaving you feeling light and energized.',
    category: 'Healthy Food',
    image: product6,
    ingredients: 'Green Tea, Bamboo Salt, Lemon, Ginger',
    benefits: [
      'Supports natural detoxification',
      'Replenishes electrolytes',
      'Boosts metabolism',
      'Refreshing taste',
    ],
    stockStatus: 'in-stock',
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

// Updated to exclude 'to-be-launched' products from featured list
export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.featured && p.stockStatus !== 'to-be-launched');
};

