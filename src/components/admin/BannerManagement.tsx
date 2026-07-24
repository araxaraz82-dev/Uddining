import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Check, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Banner } from '@/lib/supabase';

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSignal, setSavedSignal] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = () => {
    supabase.from('banners').select('*').order('sort_order').then(({ data }) => {
      setBanners((data || []) as Banner[]);
    });
  };

  const handleSave = async () => {
    if (!editing || !editing.title) return;
    setSaving(true);

    const payload = {
      title: editing.title,
      slogan: editing.slogan || '',
      image_url: editing.image_url || '',
      link_url: editing.link_url || '',
      sort_order: Number(editing.sort_order) || 0,
      is_active: editing.is_active !== false,
    };

    if (editing.id) {
      await supabase.from('banners').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('banners').insert(payload);
    }

    setSaving(false);
    setEditing(null);
    setSavedSignal(true);
    setTimeout(() => setSavedSignal(false), 2000);
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    loadBanners();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-gradient">Banner Management</h1>
        <button onClick={() => setEditing({ title: '', slogan: '', sort_order: 0, is_active: true })} className="btn-accent flex items-center gap-2">
          <Plus size={18} /> Add Banner
        </button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="glass-card overflow-hidden">
            <div className="relative h-40">
              <img
                src={banner.image_url || 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-semibold">{banner.title}</h3>
                <p className="text-gray-300 text-xs">{banner.slogan}</p>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${banner.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {banner.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setEditing(banner)} className="btn-ghost text-sm px-3 py-1.5 flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(banner.id)} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-white">
                  {editing.id ? 'Edit Banner' : 'Add Banner'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Title / Slogan</label>
                  <input
                    type="text"
                    value={editing.title || ''}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="input-glass"
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Slogan</label>
                  <input
                    type="text"
                    value={editing.slogan || ''}
                    onChange={(e) => setEditing({ ...editing, slogan: e.target.value })}
                    className="input-glass"
                    placeholder="Banner slogan"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Banner Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editing.image_url || ''}
                      onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                      className="input-glass"
                      placeholder="Image URL"
                    />
                    <button
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) setEditing({ ...editing, image_url: url });
                      }}
                      className="btn-ghost px-3"
                    >
                      <Upload size={18} />
                    </button>
                  </div>
                </div>
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                )}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sort_order || 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                    className="input-glass"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_active !== false}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                    className="accent-accent"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="btn-accent flex-1 flex items-center justify-center gap-2">
                  {saving ? 'Saving...' : <><Save size={18} /> Save</>}
                </button>
                <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
