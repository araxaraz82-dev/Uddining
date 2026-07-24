import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AISupportBox({ products }: { products: Product[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI assistant for Uddin Entreprise. Ask me about products, prices, delivery charges, or anything about our store!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();

    const matchedProduct = products.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );

    if (matchedProduct) {
      return `${matchedProduct.name} - ৳${matchedProduct.price.toLocaleString('en-BD')}\n\n${matchedProduct.description}\n\nDelivery: Inside Dhaka ৳${matchedProduct.delivery_inside_dhaka}, Outside Dhaka ৳${matchedProduct.delivery_outside_dhaka}\nCOD Charge: ৳${matchedProduct.cod_charge}\nSKU: ${matchedProduct.sku}`;
    }

    if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
      return `We have products ranging from ৳${Math.min(...products.map((p) => p.price)).toLocaleString('en-BD')} to ৳${Math.max(...products.map((p) => p.price)).toLocaleString('en-BD')}. Which product are you interested in?`;
    }

    if (q.includes('delivery') || q.includes('shipping')) {
      return 'We offer delivery all over Bangladesh. Inside Dhaka: ৳60, Outside Dhaka: ৳120. Cash on delivery is available with a small COD charge per product.';
    }

    if (q.includes('category') || q.includes('categories')) {
      const cats = [...new Set(products.map((p) => p.category_id))];
      return `We have ${cats.length} categories of products including cookeries, home appliances, kitchen tools, and small appliances. Browse our Categories section to explore!`;
    }

    if (q.includes('best seller') || q.includes('popular') || q.includes('recommend')) {
      const best = products.filter((p) => p.is_best_seller);
      if (best.length > 0) {
        return `Our best sellers include: ${best.slice(0, 3).map((p) => `${p.name} (৳${p.price.toLocaleString('en-BD')})`).join(', ')}. Check out our Best Sellers page!`;
      }
      return 'Check out our Best Sellers section for the most popular products!';
    }

    if (q.includes('contact') || q.includes('phone') || q.includes('email')) {
      return 'You can reach us via the Contact Us page. We respond to all inquiries within 24 hours!';
    }

    if (q.includes('order') || q.includes('buy') || q.includes('purchase')) {
      return 'To place an order, add products to your cart and click "Order via WhatsApp". You can also track your order using the SKU code provided after ordering.';
    }

    if (q.includes('track')) {
      return 'You can track your order by entering the SKU code on our Order Tracking page. A mini map will show your delivery status.';
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return 'Hello! Welcome to Uddin Entreprise. How can I help you today? You can ask about our products, prices, delivery, or anything else!';
    }

    if (q.includes('thank')) {
      return "You're welcome! Feel free to ask if you have any other questions. Happy shopping!";
    }

    return `I can help you with information about our products, prices, delivery charges, categories, best sellers, and ordering. Try asking about a specific product or say "show me best sellers"!`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));
    const response = generateResponse(userMsg);
    setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-accent text-ink-900'
                  : 'glass border border-white/10 text-gray-200'
              }`}
            >
              {msg.content.split('\n').map((line, j) => (
                <p key={j} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl flex items-center gap-2">
              <Sparkles size={16} className="text-accent animate-pulse" />
              <span className="text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about products, prices, delivery..."
          className="input-glass flex-1"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="btn-accent flex items-center justify-center w-12 h-12 rounded-xl"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
