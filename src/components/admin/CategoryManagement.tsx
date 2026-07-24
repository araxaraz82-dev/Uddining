import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Check, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/supabase';

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSignal, setSavedSignal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data || []) as Category[]);
    });
  };

  const handleSave = async () => {
    if (!editing || !editing.name) return;
    setSaving(true);

    const slug = editing.slug || editing.name!.toLowerCase().replace(/\s+/g, '-');
    const payload = {
      name: editing.name,
      slug,
      description: editing.description || '',
      image_url: editing.image_url || '',
    };

    if (editing.id) {
      await supabase.from('categories').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert(payload);
    }

    setSaving(false);
    setEditing(null);
    setSavedSignal(true);
    setTimeout(() => setSavedSignal(false), 2000);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in this category will lose their category link.')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-gradient">Category Management</h1>
        <button onClick={() => setEditing({ name: '', slug: '', description: '' })} className="btn-accent flex items-center gap-2">
          <Plus size={18} /> Add Category
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={cat.image_url || 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-gray-100 font-medium text-sm">{cat.name}</h3>
              <p className="text-gray-500 text-xs line-clamp-1">{cat.description}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setEditing(cat)} className="flex-1 btn-ghost text-xs px-2 py-1.5 flex items-center justify-center gap-1">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(cat.id)} className="px-2 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20">
                  <Trash2 size={12} />
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
              className="glass p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-white">
                  {editing.id ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Category Name</label>
                  <input
                    type="text"
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Slug</label>
                  <input
                    type="text"
                    value={editing.slug || ''}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="input-glass"
                    placeholder="auto-generated from name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Description</label>
                  <textarea
                    rows={2}
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="input-glass resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Category Image URL</label>
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
