import { useEffect, useState } from 'react';
import { Download, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders((data || []) as Order[]);
      setLoading(false);
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setEditingStatus(null);
    loadOrders();
  };

  const exportCSV = () => {
    const headers = ['SKU Code', 'Customer Name', 'WhatsApp', 'Address', 'Delivery Zone', 'Product', 'Product Price', 'Delivery Price', 'Total', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.sku_code,
      o.customer_name,
      o.whatsapp_number,
      `"${o.address}"`,
      o.delivery_zone,
      `"${o.product_name}"`,
      o.product_price,
      o.delivery_price,
      o.total_price,
      o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="shimmer w-full h-64 rounded-xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-gradient">Order Management</h1>
        <button onClick={exportCSV} className="btn-ghost flex items-center gap-2">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="py-3 px-2">SKU Code</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">WhatsApp</th>
                <th className="py-3 px-2 hidden md:table-cell">Address</th>
                <th className="py-3 px-2 hidden md:table-cell">Product</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2 font-mono text-accent text-xs">{order.sku_code}</td>
                  <td className="py-3 px-2 text-gray-200">{order.customer_name}</td>
                  <td className="py-3 px-2 text-gray-400">{order.whatsapp_number}</td>
                  <td className="py-3 px-2 text-gray-400 hidden md:table-cell max-w-[150px] truncate">{order.address}</td>
                  <td className="py-3 px-2 text-gray-400 hidden md:table-cell max-w-[150px] truncate">{order.product_name}</td>
                  <td className="py-3 px-2 text-accent font-medium">৳{Number(order.total_price).toLocaleString('en-BD')}</td>
                  <td className="py-3 px-2">
                    <div className="relative">
                      <button
                        onClick={() => setEditingStatus(editingStatus === order.id ? null : order.id)}
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'confirmed' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {order.status}
                        <Edit2 size={10} />
                      </button>
                      <AnimatePresence>
                        {editingStatus === order.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-10 mt-1 glass p-2 space-y-1 min-w-[120px]"
                          >
                            {statusOptions.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(order.id, s)}
                                className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 ${
                                  order.status === s ? 'text-accent' : 'text-gray-300'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
