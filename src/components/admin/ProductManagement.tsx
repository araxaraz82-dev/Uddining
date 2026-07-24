import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Check, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/lib/supabase';

type EditProduct = Partial<Product> & {
  images?: string[];
  specs_text?: string;
};

const emptyProduct: EditProduct = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  price: 0,
  cod_charge: 0,
  delivery_inside_dhaka: 60,
  delivery_outside_dhaka: 120,
  images: [],
  is_best_seller: false,
  stock: 0,
  specs: {},
  landing_content: {},
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<EditProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSignal, setSavedSignal] = useState(false);

  useEffect(() => {
    loadProducts();
    supabase.from('categories').select('*').then(({ data }) => {
      setCategories((data || []) as Category[]);
    });
  }, []);

  const loadProducts = () => {
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setProducts((data || []) as Product[]);
    });
  };

  const handleEdit = (product: Product) => {
    setEditing({
      ...product,
      specs_text: JSON.stringify(product.specs, null, 2),
      images: product.images || [],
    });
  };

  const handleNew = () => {
    setEditing({ ...emptyProduct });
  };

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setEditing((prev) => prev ? { ...prev, images: [...(prev.images || []), url] } : prev);
    }
  };

  const handleSave = async () => {
    if (!editing || !editing.name || !editing.sku) return;
    setSaving(true);

    const slug = editing.slug || editing.name!.toLowerCase().replace(/\s+/g, '-');
    let specs = {};
    try {
      specs = editing.specs_text ? JSON.parse(editing.specs_text) : {};
    } catch {
      specs = {};
    }

    const payload = {
      name: editing.name,
      slug,
      sku: editing.sku,
      description: editing.description || '',
      price: Number(editing.price) || 0,
      cod_charge: Number(editing.cod_charge) || 0,
      delivery_inside_dhaka: Number(editing.delivery_inside_dhaka) || 60,
      delivery_outside_dhaka: Number(editing.delivery_outside_dhaka) || 120,
      images: editing.images || [],
      specs,
      is_best_seller: editing.is_best_seller || false,
      stock: Number(editing.stock) || 0,
      landing_content: editing.landing_content || {},
      category_id: editing.category_id || null,
    };

    if (editing.id) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('products').insert(payload);
    }

    setSaving(false);
    setEditing(null);
    setSavedSignal(true);
    setTimeout(() => setSavedSignal(false), 2000);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-gradient">Product Management</h1>
        <button onClick={handleNew} className="btn-accent flex items-center gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Saved signal */}
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

      {/* Product list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="glass-card p-4">
            <img
              src={product.images?.[0] || 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'}
              alt={product.name}
              className="w-full h-32 object-cover rounded-xl mb-3"
            />
            <h3 className="text-gray-100 font-medium">{product.name}</h3>
            <p className="text-accent text-sm">৳{Number(product.price).toLocaleString('en-BD')}</p>
            <p className="text-gray-500 text-xs">SKU: {product.sku}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 btn-ghost text-sm flex items-center justify-center gap-1 py-2"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-white">
                  {editing.id ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">SKU</label>
                  <input
                    type="text"
                    value={editing.sku || ''}
                    onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Category</label>
                  <select
                    value={editing.category_id || ''}
                    onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}
                    className="input-glass"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Price (৳)</label>
                  <input
                    type="number"
                    value={editing.price || 0}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">COD Charge (৳)</label>
                  <input
                    type="number"
                    value={editing.cod_charge || 0}
                    onChange={(e) => setEditing({ ...editing, cod_charge: Number(e.target.value) })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Delivery Inside Dhaka (৳)</label>
                  <input
                    type="number"
                    value={editing.delivery_inside_dhaka || 60}
                    onChange={(e) => setEditing({ ...editing, delivery_inside_dhaka: Number(e.target.value) })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Delivery Outside Dhaka (৳)</label>
                  <input
                    type="number"
                    value={editing.delivery_outside_dhaka || 120}
                    onChange={(e) => setEditing({ ...editing, delivery_outside_dhaka: Number(e.target.value) })}
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Stock</label>
                  <input
                    type="number"
                    value={editing.stock || 0}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                    className="input-glass"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="input-glass resize-none"
                />
              </div>

              <div className="mt-4">
                <label className="text-sm text-gray-400 mb-1 block">Specs (JSON)</label>
                <textarea
                  rows={4}
                  value={editing.specs_text || ''}
                  onChange={(e) => setEditing({ ...editing, specs_text: e.target.value })}
                  className="input-glass resize-none font-mono text-xs"
                  placeholder='{"material": "Aluminum", "diameter": "28cm"}'
                />
              </div>

              {/* Images */}
              <div className="mt-4">
                <label className="text-sm text-gray-400 mb-2 block">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(editing.images || []).map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl" />
                      <button
                        onClick={() => setEditing({
                          ...editing,
                          images: editing.images!.filter((_, idx) => idx !== i),
                        })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleImageAdd}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-accent/40 flex items-center justify-center text-gray-500 hover:text-accent transition-all"
                  >
                    <Upload size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_best_seller || false}
                    onChange={(e) => setEditing({ ...editing, is_best_seller: e.target.checked })}
                    className="accent-accent"
                  />
                  <span className="text-sm text-gray-300">Best Seller</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-accent flex-1 flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving...' : <><Save size={18} /> Save</>}
                </button>
                <button onClick={() => setEditing(null)} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
