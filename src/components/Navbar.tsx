import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShoppingBag, LayoutDashboard, Truck, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/supabase';

export default function Navbar() {
  const { totalItems } = useCart();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as SiteSettings);
      });
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Category', path: '/category/cookeries' },
    { label: 'Best Seller', path: '/best-sellers' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-gray-300 hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 md:h-10 w-auto" />
            ) : (
              <span className="font-display font-bold text-lg md:text-xl text-gradient">
                {settings?.site_name || 'Uddin Entreprise'}
              </span>
            )}
          </Link>

          {/* Right: nav links + icons */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.slice(2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-gray-300 hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/tracking')}
                className="text-gray-300 hover:text-accent transition-colors duration-300 relative"
                title="Order Tracking"
              >
                <Truck size={20} />
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="text-gray-300 hover:text-accent transition-colors duration-300 relative"
                title="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-ink-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/admin')}
                className="text-gray-300 hover:text-accent transition-colors duration-300"
                title="Admin Panel"
              >
                <LayoutDashboard size={20} />
              </button>
            </div>
          </div>

          {/* Mobile right icons */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={() => navigate('/cart')} className="text-gray-300 relative">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-ink-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/admin')} className="text-gray-300">
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-gray-300 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/tracking"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-gray-300 hover:text-accent transition-colors"
            >
              Order Tracking
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
