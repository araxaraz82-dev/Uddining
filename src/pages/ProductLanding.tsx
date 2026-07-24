import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Check, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/supabase';

export default function ProductLanding() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProduct(data as Product);
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

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400 text-lg">Product not found.</p>
        <Link to="/" className="text-accent mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'];

  return (
    <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
      <Link to="/category/cookeries" className="inline-flex items-center gap-2 text-gray-400 hover:text-accent mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Products
      </Link>

      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
      >
        {/* Image gallery */}
        <div className="space-y-4">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass-card overflow-hidden aspect-square"
          >
            <img
              src={images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-accent' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col justify-center">
          {product.is_best_seller && (
            <span className="inline-block mb-3 text-xs px-3 py-1 rounded-full bg-accent/20 text-accent w-fit">
              Best Seller
            </span>
          )}
          <motion.h1
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display font-bold text-3xl md:text-4xl text-white mb-4"
          >
            {product.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 mb-6 leading-relaxed"
          >
            {product.description}
          </motion.p>

          <div className="glass p-6 mb-6">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-accent">
                ৳{product.price.toLocaleString('en-BD')}
              </span>
              {product.cod_charge > 0 && (
                <span className="text-sm text-gray-500">+ ৳{product.cod_charge} COD</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Truck size={16} className="text-accent" />
                Inside Dhaka: ৳{product.delivery_inside_dhaka}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Truck size={16} className="text-accent" />
                Outside Dhaka: ৳{product.delivery_outside_dhaka}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-accent" />
                SKU: {product.sku}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Check size={16} className="text-accent" />
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => addItem(product)}
              className="btn-accent flex items-center gap-2 flex-1 justify-center"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <Link to="/cart" className="btn-ghost flex items-center justify-center">
              View Cart
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Specs section */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-display font-bold text-2xl text-gradient mb-6">Specifications</h2>
          <div className="glass p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400 capitalize">{key}</span>
                <span className="text-gray-200 font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Landing content sections */}
      {(() => {
        const sections = product.landing_content?.sections;
        if (!sections || !Array.isArray(sections)) return null;
        return (sections as Array<Record<string, unknown>>).map((section, i) => (
          <motion.section
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16 glass p-8 md:p-12 text-center"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gradient mb-4">
              {String(section.title || '')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {String(section.subtitle || '')}
            </p>
          </motion.section>
        ));
      })()}
    </div>
  );
}
