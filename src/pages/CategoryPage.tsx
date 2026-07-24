import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      supabase.from('categories').select('*').eq('slug', slug).maybeSingle(),
      supabase.from('products').select('*').eq('category_id', (
        // Need to fetch category first
        null as unknown as string
      )),
    ]).then(async ([catRes]) => {
      if (catRes.data) {
        const cat = catRes.data as Category;
        setCategory(cat);
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', cat.id);
        setProducts((prods || []) as Product[]);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="shimmer w-32 h-32 rounded-full" />
      </div>
    );
  }

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-gradient mb-2">
          {category?.name || 'Category'}
        </h1>
        <p className="text-gray-400">{category?.description || 'Browse our products'}</p>
      </div>

      {products.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-gray-400 text-lg">No products in this category yet. Check back soon!</p>
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
