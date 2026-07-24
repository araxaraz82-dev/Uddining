import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { ArrowRight, Sparkles, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Banner, Category, Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import AISupportBox from '@/components/AISupportBox';

gsap.registerPlugin(useGSAP);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('*').eq('is_best_seller', true).limit(10),
      supabase.from('products').select('*').limit(15),
    ]).then(([b, c, bs, ap]) => {
      if (b.data) setBanners(b.data as Banner[]);
      if (c.data) setCategories(c.data as Category[]);
      if (bs.data) setBestSellers(bs.data as Product[]);
      if (ap.data) setAllProducts(ap.data as Product[]);
    });
  }, []);

  useGSAP(
    () => {
      gsap.from('.hero-text', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
      });
      gsap.from('.hero-image', {
        scale: 1.15,
        opacity: 0,
        duration: 1.5,
        ease: 'power2.out',
      });
    },
    { scope: container }
  );

  return (
    <div ref={container}>
      {/* Banner / Hero with GSAP ScrollTrigger slideshow */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-full w-full"
        >
          {banners.length === 0 && (
            <SwiperSlide>
              <div className="h-full w-full bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="hero-text font-display font-bold text-4xl md:text-6xl text-gradient mb-4">
                    Uddin Entreprise
                  </h1>
                  <p className="hero-text text-gray-400 text-lg">Quality cookeries & home appliances</p>
                </div>
              </div>
            </SwiperSlide>
          )}
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative h-full w-full">
                <img
                  src={banner.image_url || 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'}
                  alt={banner.title}
                  className="hero-image absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/60 to-transparent" />
                <div className="relative h-full flex items-center px-6 md:px-16">
                  <div className="max-w-xl">
                    <h2 className="hero-text font-display font-bold text-3xl md:text-5xl text-white mb-4">
                      {banner.title}
                    </h2>
                    <p className="hero-text text-gray-300 text-base md:text-lg mb-6">
                      {banner.slogan}
                    </p>
                    <Link to="/category/cookeries" className="btn-accent inline-flex items-center gap-2">
                      Shop Now <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Best Sellers Carousel */}
      {bestSellers.length > 0 && (
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              <span className="text-gradient">Best Sellers</span>
            </h2>
            <Link to="/best-sellers" className="text-accent text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <Swiper
            modules={[Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="!pb-4"
          >
            {bestSellers.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-8 text-center">
          <span className="text-gradient">Shop by Category</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              to={`/category/${cat.slug}`}
              key={cat.id}
              className="glass-card overflow-hidden group"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={cat.image_url || 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-100 group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Products */}
      {allProducts.length > 0 && (
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-8">
            <span className="text-gradient">Featured Products</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* AI Support Box */}
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="glass p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center pulse-glow">
              <Sparkles size={24} className="text-accent" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-gradient">AI Support</h2>
              <p className="text-gray-400 text-sm">Ask about products or anything on our site</p>
            </div>
          </div>
          <AISupportBox products={allProducts} />
        </div>
      </section>
    </div>
  );
}
