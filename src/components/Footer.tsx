import { Link } from 'react-router-dom';
import { Facebook, Instagram, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/supabase';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as SiteSettings);
      });
  }, []);

  return (
    <footer className="glass-nav mt-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display font-bold text-xl text-gradient mb-3">
              {settings?.site_name || 'Uddin Entreprise'}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings?.footer_text || 'Your trusted partner for quality cookeries and home appliances.'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Contact Details</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{settings?.contact_email || 'contact@uddinentreprise.com'}</li>
              <li>{settings?.contact_phone || '+8801000000000'}</li>
              <li>{settings?.contact_address || 'Dhaka, Bangladesh'}</li>
            </ul>
          </div>

          {/* Links + Social */}
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400 mb-4">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <Link to="/category/cookeries" className="hover:text-accent transition-colors">Categories</Link>
              <Link to="/best-sellers" className="hover:text-accent transition-colors">Best Sellers</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link>
            </div>
            <div className="flex gap-4">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  <Facebook size={22} />
                </a>
              )}
              {!settings?.facebook_url && (
                <span className="text-gray-400 hover:text-accent transition-colors cursor-pointer">
                  <Facebook size={22} />
                </span>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  <Instagram size={22} />
                </a>
              )}
              {!settings?.instagram_url && (
                <span className="text-gray-400 hover:text-accent transition-colors cursor-pointer">
                  <Instagram size={22} />
                </span>
              )}
              {settings?.telegram_url && (
                <a
                  href={settings.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  <Send size={22} />
                </a>
              )}
              {!settings?.telegram_url && (
                <span className="text-gray-400 hover:text-accent transition-colors cursor-pointer">
                  <Send size={22} />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {settings?.site_name || 'Uddin Entreprise'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
