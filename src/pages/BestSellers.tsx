import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_best_seller', true)
      .then(({ data }) => {
        setProducts((data || []) as Product[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="font-display font-bold text-3xl md:text-4xl text-gradient mb-8">
        Best Sellers
      </h1>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-80 shimmer" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-gray-400 text-lg">No best sellers yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
