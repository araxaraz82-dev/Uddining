import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  cod_charge: number;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  images: string[];
  specs: Record<string, string>;
  is_best_seller: boolean;
  landing_content: Record<string, unknown>;
  stock: number;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  sku_code: string;
  customer_name: string;
  whatsapp_number: string;
  address: string;
  delivery_zone: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  delivery_price: number;
  total_price: number;
  status: string;
  created_at: string;
};

export type SiteSettings = {
  id: string;
  site_name: string;
  logo_url: string | null;
  footer_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  facebook_url: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  admin_email: string;
  admin_password: string;
};

export type Banner = {
  id: string;
  title: string;
  slogan: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
};
