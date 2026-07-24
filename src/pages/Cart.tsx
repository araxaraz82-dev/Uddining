import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, MessageCircle, Check, X, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [customer, setCustomer] = useState({ name: '', whatsapp: '', address: '' });
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('inside');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    sku: string;
    message: string;
    items: { name: string; price: number; qty: number }[];
    delivery: number;
    total: number;
  } | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const productTotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const deliveryPrice =
    items.length > 0
      ? deliveryZone === 'inside'
        ? Math.max(...items.map((i) => i.product.delivery_inside_dhaka))
        : Math.max(...items.map((i) => i.product.delivery_outside_dhaka))
      : 0;

  const codTotal = items.reduce((sum, i) => sum + (i.product.cod_charge || 0) * i.quantity, 0);
  const grandTotal = productTotal + deliveryPrice + codTotal;

  const buildWhatsAppMessage = (sku: string): string => {
    const lines = [
      `*New Order - Uddin Entreprise*`,
      `Order SKU: ${sku}`,
      ``,
      `*Customer Details:*`,
      `Name: ${customer.name}`,
      `WhatsApp: ${customer.whatsapp}`,
      `Address: ${customer.address}`,
      `Delivery Zone: ${deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}`,
      ``,
      `*Products:*`,
    ];
    items.forEach((i, idx) => {
      lines.push(
        `${idx + 1}. ${i.product.name} (SKU: ${i.product.sku}) - ৳${i.product.price.toLocaleString('en-BD')} x ${i.quantity} = ৳${(i.product.price * i.quantity).toLocaleString('en-BD')}`
      );
    });
    lines.push('');
    lines.push(`Product Total: ৳${productTotal.toLocaleString('en-BD')}`);
    lines.push(`Delivery Charge: ৳${deliveryPrice.toLocaleString('en-BD')}`);
    if (codTotal > 0) lines.push(`COD Charge: ৳${codTotal.toLocaleString('en-BD')}`);
    lines.push(`*Grand Total: ৳${grandTotal.toLocaleString('en-BD')}*`);
    return lines.join('\n');
  };

  const handleOrder = async () => {
    if (!customer.name || !customer.whatsapp || !customer.address || items.length === 0) return;

    const sku = `UE-${Date.now().toString().slice(-8)}`;
    const message = buildWhatsAppMessage(sku);

    // Save order to database
    for (const item of items) {
      await supabase.from('orders').insert({
        sku_code: sku,
        customer_name: customer.name,
        whatsapp_number: customer.whatsapp,
        address: customer.address,
        delivery_zone: deliveryZone,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price * item.quantity,
        delivery_price: deliveryPrice,
        total_price: grandTotal,
        status: 'pending',
      });
    }

    // Show receipt to user (but they don't see the WhatsApp message content)
    setReceiptData({
      sku,
      message,
      items: items.map((i) => ({
        name: i.product.name,
        price: i.product.price,
        qty: i.quantity,
      })),
      delivery: deliveryPrice,
      total: grandTotal,
    });
    setShowReceipt(true);
    setOrderSuccess(true);

    // Send via WhatsApp silently (open WhatsApp with pre-filled message)
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    clearCart();
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="py-20 px-4 text-center max-w-2xl mx-auto">
        <div className="glass p-12">
          <h2 className="font-display font-bold text-2xl text-gradient mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-6">Browse our products and add items to your cart.</p>
          <Link to="/category/cookeries" className="btn-accent inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="font-display font-bold text-3xl md:text-4xl text-gradient mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart items + customer form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart items */}
          <div className="glass p-6 space-y-4">
            <h2 className="font-semibold text-lg text-white mb-4">Order Items</h2>
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0"
              >
                <img
                  src={item.product.images?.[0] || 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-gray-100 font-medium">{item.product.name}</h3>
                  <p className="text-accent text-sm">৳{item.product.price.toLocaleString('en-BD')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                  >
                    -
                  </button>
                  <span className="text-gray-200 w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Customer details */}
          <div className="glass p-6 space-y-4">
            <h2 className="font-semibold text-lg text-white mb-2">Delivery Details</h2>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Customer Name</label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="input-glass"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">WhatsApp Number</label>
              <input
                type="tel"
                value={customer.whatsapp}
                onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })}
                className="input-glass"
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Address</label>
              <textarea
                rows={3}
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="input-glass resize-none"
                placeholder="Full delivery address"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Delivery Charge</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="zone"
                    checked={deliveryZone === 'inside'}
                    onChange={() => setDeliveryZone('inside')}
                    className="accent-accent"
                  />
                  <span className="text-gray-300 text-sm">Inside Dhaka (৳{items.length > 0 ? Math.max(...items.map((i) => i.product.delivery_inside_dhaka)) : 0})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="zone"
                    checked={deliveryZone === 'outside'}
                    onChange={() => setDeliveryZone('outside')}
                    className="accent-accent"
                  />
                  <span className="text-gray-300 text-sm">Outside Dhaka (৳{items.length > 0 ? Math.max(...items.map((i) => i.product.delivery_outside_dhaka)) : 0})</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-1">
          <div className="glass p-6 sticky top-24">
            <h2 className="font-semibold text-lg text-white mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Product Price</span>
                <span>৳{productTotal.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery Charge</span>
                <span>৳{deliveryPrice.toLocaleString('en-BD')}</span>
              </div>
              {codTotal > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>COD Charge</span>
                  <span>৳{codTotal.toLocaleString('en-BD')}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-accent">৳{grandTotal.toLocaleString('en-BD')}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={!customer.name || !customer.whatsapp || !customer.address}
              className="btn-accent w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageCircle size={20} /> Order via WhatsApp
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Your order will be sent to us via WhatsApp automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Receipt modal */}
      <AnimatePresence>
        {showReceipt && receiptData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowReceipt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Check size={32} className="text-green-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-white">Order Placed!</h2>
                <p className="text-gray-400 text-sm mt-1">Your order has been sent successfully.</p>
              </div>

              <div className="glass p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt size={18} className="text-accent" />
                  <span className="text-sm font-semibold text-gray-200">Order Receipt</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Order SKU</span>
                    <span className="text-accent font-mono">{receiptData.sku}</span>
                  </div>
                  {receiptData.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-300">
                      <span>{item.name} x{item.qty}</span>
                      <span>৳{(item.price * item.qty).toLocaleString('en-BD')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-gray-400 border-t border-white/10 pt-2">
                    <span>Delivery</span>
                    <span>৳{receiptData.delivery.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
                    <span className="text-white">Total</span>
                    <span className="text-accent">৳{receiptData.total.toLocaleString('en-BD')}</span>
                  </div>
                </div>
              </div>

              <div className="glass p-3 border border-accent/20 mb-4">
                <p className="text-xs text-gray-500 mb-1">Save this SKU code to track your order:</p>
                <p className="font-mono text-accent text-lg text-center">{receiptData.sku}</p>
              </div>

              <div className="flex gap-3">
                <Link to="/tracking" className="btn-ghost flex-1 text-center" onClick={() => setShowReceipt(false)}>
                  Track Order
                </Link>
                <button onClick={() => setShowReceipt(false)} className="btn-accent flex-1">
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
