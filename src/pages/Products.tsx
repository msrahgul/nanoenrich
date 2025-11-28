import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/products/SearchBar';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { useProducts } from '@/context/ProductContext';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const { getProductsByCategory, searchProducts } = useProducts();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    let result = getProductsByCategory(selectedCategory);

    if (searchQuery.trim()) {
      const searchResults = searchProducts(searchQuery);
      result = result.filter(p => searchResults.some(sr => sr.id === p.id));
    }

    return result;
  }, [selectedCategory, searchQuery, getProductsByCategory, searchProducts]);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-card py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#5E3A86] mb-3">
            Our Products
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our complete range of natural wellness products. Filter by category or search to find exactly what you need.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-background border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
            />
            <div className="w-full md:w-64">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search products..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No products found. Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Products;
