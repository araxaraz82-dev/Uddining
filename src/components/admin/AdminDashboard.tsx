import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, ShoppingBag, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, Product } from '@/lib/supabase';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*'),
    ]).then(([o, p]) => {
      setOrders((o.data || []) as Order[]);
      setProducts((p.data || []) as Product[]);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  // Product selling ratio
  const productSales: Record<string, number> = {};
  orders.forEach((o) => {
    const name = o.product_name;
    productSales[name] = (productSales[name] || 0) + 1;
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString('en-BD')}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-accent' },
    { label: 'Pending', value: pendingOrders, icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Delivered', value: deliveredOrders, icon: Package, color: 'text-blue-400' },
  ];

  if (loading) {
    return <div className="shimmer w-full h-64 rounded-xl" />;
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gradient mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Product selling ratio */}
      <div className="glass p-6">
        <h2 className="font-semibold text-lg text-white mb-4">Product Selling Ratio</h2>
        {topProducts.length === 0 ? (
          <p className="text-gray-400 text-sm">No sales data yet.</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map(([name, count], i) => {
              const maxCount = topProducts[0][1];
              const percentage = (count / maxCount) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{name}</span>
                    <span className="text-accent">{count} orders</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-accent-dark to-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="glass p-6 mt-6">
        <h2 className="font-semibold text-lg text-white mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0"
              >
                <div>
                  <p className="text-gray-200 text-sm">{order.product_name}</p>
                  <p className="text-gray-500 text-xs">{order.customer_name} • {order.sku_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent text-sm">৳{Number(order.total_price).toLocaleString('en-BD')}</p>
                  <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
