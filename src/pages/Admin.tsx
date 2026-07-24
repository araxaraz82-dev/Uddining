import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Settings,
  Image,
  ClipboardList,
  FolderTree,
  Eye,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ProductManagement from '@/components/admin/ProductManagement';
import SiteManagement from '@/components/admin/SiteManagement';
import BannerManagement from '@/components/admin/BannerManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';

export default function Admin() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="shimmer w-32 h-32 rounded-full" />
      </div>
    );
  }

  // Not logged in → show login page
  if (!session) {
    return <AdminLogin />;
  }

  // Logged in but not admin → show customer view
  if (session && !isAdmin) {
    return (
      <div className="py-20 px-4 text-center max-w-md mx-auto">
        <div className="glass p-8">
          <h2 className="font-display font-bold text-2xl text-gradient mb-4">
            Customer Account
          </h2>
          <p className="text-gray-400 mb-6">
            You're logged in as <span className="text-accent">{session.user.email}</span>. Browse our store and track your orders.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/" className="btn-accent">Browse Products</Link>
            <Link to="/tracking" className="btn-ghost">Track Orders</Link>
            <button onClick={signOut} className="btn-ghost flex items-center justify-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/site', label: 'Site Settings', icon: Settings },
    { path: '/admin/banners', label: 'Banners', icon: Image },
    { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 left-0 z-40 w-64 h-screen glass-nav border-r border-white/5 transition-transform duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="font-display font-bold text-xl text-gradient">Admin Panel</h2>
          <p className="text-xs text-gray-500 mt-1">Uddin Entreprise</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
          >
            <Eye size={18} /> View Site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden glass-nav sticky top-0 z-20 flex items-center justify-between px-4 h-16">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-300">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-display font-bold text-gradient">Admin</span>
          <Link to="/" className="text-gray-300">
            <Eye size={20} />
          </Link>
        </div>

        {/* Admin routes */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/site" element={<SiteManagement />} />
            <Route path="/banners" element={<BannerManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
