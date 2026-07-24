import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/supabase';

export default function SiteManagement() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSignal, setSavedSignal] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').maybeSingle().then(({ data }) => {
      if (data) setSettings(data as SiteSettings);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from('site_settings').update({
      site_name: settings.site_name,
      logo_url: settings.logo_url,
      footer_text: settings.footer_text,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      contact_address: settings.contact_address,
      facebook_url: settings.facebook_url,
      instagram_url: settings.instagram_url,
      telegram_url: settings.telegram_url,
      admin_email: settings.admin_email,
      admin_password: settings.admin_password,
    }).eq('id', settings.id);

    setSaving(false);
    setSavedSignal(true);
    setTimeout(() => setSavedSignal(false), 2000);
  };

  if (!settings) return <div className="shimmer w-full h-64 rounded-xl" />;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gradient mb-6">Site Settings</h1>

      <AnimatePresence>
        {savedSignal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 right-4 z-50 glass p-3 border border-green-500/30 flex items-center gap-2"
          >
            <Check size={20} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">Saved!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Site identity */}
        <div className="glass p-6">
          <h2 className="font-semibold text-lg text-white mb-4">Site Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Site Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Logo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="input-glass"
                  placeholder="Logo image URL"
                />
                <button
                  onClick={() => {
                    const url = prompt('Enter logo image URL:');
                    if (url) setSettings({ ...settings, logo_url: url });
                  }}
                  className="btn-ghost px-3"
                >
                  <Upload size={18} />
                </button>
              </div>
            </div>
          </div>
          {settings.logo_url && (
            <div className="mt-3">
              <img src={settings.logo_url} alt="Logo preview" className="h-12 w-auto rounded-lg" />
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="glass p-6">
          <h2 className="font-semibold text-lg text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="input-glass"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">Contact Address</label>
              <input
                type="text"
                value={settings.contact_address}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                className="input-glass"
              />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="glass p-6">
          <h2 className="font-semibold text-lg text-white mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Facebook URL</label>
              <input
                type="text"
                value={settings.facebook_url || ''}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="input-glass"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Instagram URL</label>
              <input
                type="text"
                value={settings.instagram_url || ''}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="input-glass"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Telegram URL</label>
              <input
                type="text"
                value={settings.telegram_url || ''}
                onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                className="input-glass"
                placeholder="https://t.me/..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="glass p-6">
          <h2 className="font-semibold text-lg text-white mb-4">Footer Text</h2>
          <textarea
            rows={3}
            value={settings.footer_text}
            onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
            className="input-glass resize-none"
          />
        </div>

        {/* Admin credentials */}
        <div className="glass p-6">
          <h2 className="font-semibold text-lg text-white mb-4">Admin Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Admin Email</label>
              <input
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Admin Password</label>
              <input
                type="text"
                value={settings.admin_password}
                onChange={(e) => setSettings({ ...settings, admin_password: e.target.value })}
                className="input-glass"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: Changing email here updates the site settings record. To change login credentials, use Supabase Auth.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-accent flex items-center gap-2"
        >
          {saving ? 'Saving...' : <><Save size={18} /> Save All Changes</>}
        </button>
      </div>
    </div>
  );
}
