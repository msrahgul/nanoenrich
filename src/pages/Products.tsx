import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/products/SearchBar';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { useProducts } from '@/context/ProductContext';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  // Replaced complex dropdown state with a simple boolean toggle
  const [showInStockOnly, setShowInStockOnly] = useState(false);

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
    // 1. Get products by category
    let result = getProductsByCategory(selectedCategory);

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const searchResults = searchProducts(searchQuery);
      result = result.filter(p => searchResults.some(sr => sr.id === p.id));
    }

    // 3. Filter by Stock Status (Toggle)
    if (showInStockOnly) {
      result = result.filter(p => p.stockStatus === 'in-stock');
    }

    // 4. Sort: In-Stock first, then Out-of-Stock, then To-be-Launched
    // We keep this sort even when filtered, though it mostly matters when showInStockOnly is false
    const statusPriority: Record<string, number> = {
      'in-stock': 0,
      'out-of-stock': 1,
      'to-be-launched': 2
    };

    result.sort((a, b) => {
      const priorityA = statusPriority[a.stockStatus] ?? 99;
      const priorityB = statusPriority[b.stockStatus] ?? 99;
      return priorityA - priorityB;
    });

    return result;
  }, [selectedCategory, searchQuery, showInStockOnly, getProductsByCategory, searchProducts]);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-card py-8 md:py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-secondary mb-3">
            Our Products
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
            Explore our complete range of natural wellness products. Filter by category or search to find exactly what you need.
          </p>
        </div>
      </section>

      {/* Filters & Search Sticky Bar */}
      <section className="py-4 bg-background border-b border-border sticky top-[57px] md:top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">

            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Left: Category Pills */}
              <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategoryChange}
                />
              </div>

              {/* Right: Search & In-Stock Toggle */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

                {/* In Stock Toggle */}
                <div className="flex items-center justify-between sm:justify-start space-x-2 bg-muted/30 border border-border rounded-md px-4 h-10 shrink-0">
                  <Label htmlFor="in-stock-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                    In Stock Only
                  </Label>
                  <Switch
                    id="in-stock-mode"
                    checked={showInStockOnly}
                    onCheckedChange={setShowInStockOnly}
                  />
                </div>

                {/* Search Bar */}
                <div className="w-full sm:w-64">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search products..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12 bg-background min-h-[50vh]">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-border mx-auto max-w-2xl">
              <p className="text-muted-foreground text-lg font-medium">
                No products found.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {showInStockOnly
                  ? "Try turning off the 'In Stock Only' filter or adjusting your search."
                  : "Try adjusting your search or category."}
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start">
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
