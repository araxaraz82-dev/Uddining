import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/supabase';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <motion.div
      whileHover={{ y: -8, rotateX: 5, rotateY: 5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="glass-card overflow-hidden group perspective-1000"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-ink-700">
          <img
            src={product.images?.[0] || 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-100 group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-accent font-bold text-lg">
            ৳{product.price.toLocaleString('en-BD')}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="w-10 h-10 rounded-full bg-accent/20 hover:bg-accent hover:text-ink-900 text-accent flex items-center justify-center transition-all duration-300"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
        {product.is_best_seller && (
          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
            Best Seller
          </span>
        )}
      </div>
    </motion.div>
  );
}
