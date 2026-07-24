import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';

export default function OrderTracking() {
  const [sku, setSku] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'shipped', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = order
    ? statusSteps.findIndex((s) => s.key === order.status)
    : -1;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    const { data, error: queryError } = await supabase
      .from('orders')
      .select('*')
      .eq('sku_code', sku.trim().toUpperCase())
      .maybeSingle();

    setLoading(false);

    if (queryError) {
      setError('Something went wrong. Please try again.');
      return;
    }
    if (!data) {
      setError('No order found with this SKU code. Please check and try again.');
      return;
    }
    setOrder(data as Order);
  };

  return (
    <div className="py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display font-bold text-3xl md:text-4xl text-gradient mb-4">
          Track Your Order
        </h1>
        <p className="text-gray-400">Enter your SKU code to see delivery status</p>
      </motion.div>

      <form onSubmit={handleTrack} className="max-w-md mx-auto mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="input-glass flex-1"
            placeholder="Enter SKU code (e.g., UE-12345678)"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-accent flex items-center gap-2"
          >
            <Search size={18} /> {loading ? '...' : 'Track'}
          </button>
        </div>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-4 text-center text-red-400 border border-red-500/20 max-w-md mx-auto"
        >
          {error}
        </motion.div>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 md:p-8"
        >
          {/* Order info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-gray-500 text-sm">Order SKU</p>
              <p className="text-accent font-mono text-lg">{order.sku_code}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Customer</p>
              <p className="text-gray-200">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Product</p>
              <p className="text-gray-200">{order.product_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Price</p>
              <p className="text-accent font-bold">৳{order.total_price.toLocaleString('en-BD')}</p>
            </div>
          </div>

          {/* Status timeline */}
          <div className="mb-8">
            <h3 className="text-gray-200 font-semibold mb-4">Delivery Status</h3>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isComplete = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div
                    key={step.key}
                    className="flex md:flex-col items-center gap-2 flex-1 relative"
                  >
                    <div className="flex md:flex-col items-center gap-2 w-full">
                      <div className="flex items-center w-full">
                        {i > 0 && (
                          <div
                            className={`h-1 flex-1 md:h-1 md:flex-1 ${
                              i <= currentStepIndex ? 'bg-accent' : 'bg-white/10'
                            }`}
                          />
                        )}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isComplete
                              ? 'bg-accent text-ink-900 border-accent'
                              : 'bg-white/5 text-gray-500 border-white/10'
                          } ${isCurrent ? 'pulse-glow' : ''}`}
                        >
                          <Icon size={18} />
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div
                            className={`h-1 flex-1 ${
                              i < currentStepIndex ? 'bg-accent' : 'bg-white/10'
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-xs md:text-center ${
                          isComplete ? 'text-accent' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mini map */}
          <div className="glass p-4 border border-white/10">
            <h3 className="text-gray-200 font-semibold mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-accent" /> Delivery Location
            </h3>
            <div className="relative h-48 rounded-xl overflow-hidden bg-ink-700">
              <div className="absolute inset-0 bg-gradient-to-br from-ink-600/50 to-ink-800/50" />
              {/* Simulated map grid */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                }}
              />
              {/* Delivery route */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                <path
                  d="M 50 150 Q 150 50 200 100 T 350 50"
                  stroke="rgba(224, 184, 115, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  fill="none"
                />
                <circle cx="50" cy="150" r="6" fill="#e0b873" />
                <circle cx="350" cy="50" r="6" fill="#e0b873">
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
              <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                {order.delivery_zone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
              </div>
              <div className="absolute top-2 right-2 text-xs text-gray-400">
                Status: {order.status}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {order.status === 'delivered'
                ? 'Your order has been delivered!'
                : order.status === 'shipped'
                ? 'Your order is out for delivery!'
                : 'Your order is being processed.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
