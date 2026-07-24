import { useState } from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/supabase';
import { useEffect } from 'react';

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [aiReply, setAiReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as SiteSettings);
      });
  }, []);

  const generateAIReply = (message: string): string => {
    const q = message.toLowerCase();
    if (q.includes('price') || q.includes('cost'))
      return 'Our products range from ৳1,299 to ৳2,499. Which product are you interested in?';
    if (q.includes('delivery'))
      return 'We deliver all over Bangladesh. Inside Dhaka ৳60, Outside Dhaka ৳120. Cash on delivery available!';
    if (q.includes('warranty'))
      return 'All our products come with manufacturer warranty. Contact us for specific warranty details.';
    if (q.includes('return'))
      return 'We offer 7-day return policy for unused products in original packaging.';
    return "Thank you for your message! Our team will get back to you within 24 hours. For urgent queries, call us or message us on WhatsApp.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setAiReply(generateAIReply(form.message));
    setSubmitting(false);
  };

  return (
    <div className="py-12 px-4 md:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-display font-bold text-3xl md:text-4xl text-gradient mb-4">
          Contact Us
        </h1>
        <p className="text-gray-400">We'd love to hear from you. Reach out anytime!</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 space-y-6"
        >
          <h2 className="font-display font-bold text-xl text-white">Get in Touch</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <Mail size={20} className="text-accent" />
              <span>{settings?.contact_email || 'contact@uddinentreprise.com'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Phone size={20} className="text-accent" />
              <span>{settings?.contact_phone || '+8801000000000'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin size={20} className="text-accent" />
              <span>{settings?.contact_address || 'Dhaka, Bangladesh'}</span>
            </div>
          </div>
        </motion.div>

        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-glass"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email ID</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-glass"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone No.</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-glass"
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-glass resize-none"
                placeholder="Write your message here..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-accent w-full flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending...' : <><Send size={18} /> Send Message</>}
            </button>
          </form>

          {aiReply && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass p-4 border border-accent/20"
            >
              <p className="text-sm text-accent font-semibold mb-1">AI Reply:</p>
              <p className="text-sm text-gray-300">{aiReply}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
