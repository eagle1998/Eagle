import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Loader2, Search } from 'lucide-react';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const emptyForm = {
  name: '', slug: '', category: '', brand: '', description: '', price: '', discount: 0,
  stock: 0, stockStatus: 'in_stock', isVisible: true, isFeatured: false,
  alcohol: '', volume: '', origin: '', images: [], imagesInput: '', accent: ''
};

const slugify = (str) => String(str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const isValidSlug = (slug) => /^[a-z0-9-]+$/.test(slug);

export default function AdminProductFormPage() {
  const { loading: authLoading } = useRedirect();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!editing);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const [cats, products] = await Promise.all([
          api.get('/categories').then(d => Array.isArray(d) ? d : []),
          editing ? api.get('/products/manage').then(d => Array.isArray(d) ? d : []) : Promise.resolve([])
        ]);
        setCategories(cats);
        if (editing) {
          const p = products.find(x => (x._id || x.id) === id);
          if (!p) {
            setError('Product not found. It may have been deleted.');
            setLoading(false);
            return;
          }
          setForm({
            name: p.name || '', slug: p.slug || '', category: p.category?._id || p.category || '',
            brand: p.brand || '', description: p.description || '', price: p.price || '', discount: p.discount || 0,
            stock: p.stock ?? 0, stockStatus: p.stockStatus || 'in_stock', isVisible: p.isVisible !== false,
            isFeatured: p.isFeatured || false, alcohol: p.alcohol || '', volume: p.volume || '',
            origin: p.origin || '', images: p.images || [], imagesInput: (p.images || []).join(', '), accent: p.accent || ''
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, editing, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'slug') setAutoSlug(false);
    if (name === 'name' && autoSlug && !editing) {
      setForm(prev => ({ ...prev, name: value, slug: slugify(value) }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'slug') setSlugError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSlugError('');
    const slug = slugify(form.slug);
    if (!slug || !isValidSlug(slug)) {
      setSlugError('Slug must contain only lowercase letters, numbers and hyphens (e.g. premium-whisky).');
      return;
    }
    setSaving(true);
    try {
      if (!form.category) {
        throw new Error('Please select a category for the product.');
      }
      const images = form.imagesInput ? form.imagesInput.split(',').map(u => u.trim()).filter(Boolean) : form.images;
      const payload = { ...form, slug, images, price: Number(form.price), discount: Number(form.discount), stock: Number(form.stock) };
      delete payload.imagesInput;
      if (editing) {
        await api.put(`/products/${id}`, payload);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        setSuccess('Product created successfully!');
      }
      setTimeout(() => navigate('/admin/products'), 900);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save');
      setSaving(false);
    }
  };

  const goBack = () => navigate('/admin/products');

  if (authLoading || loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-topbar">
          <div className="admin-search">
            <Search size={16} />
            <input type="text" disabled placeholder="Search products…" />
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-ghost !w-10 !h-10" disabled><Bell size={18} /></button>
          </div>
        </div>
        <main className="admin-main flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="text-eagle-gold animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-topbar">
        <div className="admin-search">
          <Search size={16} strokeWidth={2} />
          <input type="text" placeholder="Search products…" readOnly />
        </div>
        <div className="admin-topbar-actions">
          <button className="btn btn-ghost !w-10 !h-10 shrink-0" type="button" aria-label="Notifications">
            <Bell size={18} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <main className="admin-main">
        <div className="admin-form-wrap animate-fade-in">
          <div className="glass-card admin-form-card">
            <div className="admin-form-stickybar">
              <div className="flex items-center gap-3 min-w-0">
                <Button type="button" variant="secondary" icon={ArrowLeft} onClick={goBack} title="Back to products">
                  Back
                </Button>
                <div className="min-w-0">
                  <h1>{editing ? 'Edit Product' : 'New Product'}</h1>
                  <p>{editing ? `Editing product #${id}` : 'Create a new product'}</p>
                </div>
              </div>
              <div className="admin-form-actions">
                <Button type="button" variant="secondary" onClick={goBack}>Cancel</Button>
                <Button type="submit" form="product-form" loading={saving} style={{ minWidth: '11rem' }}>
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </div>

            <div className="admin-form-body">
              {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}
              {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

              <form id="product-form" onSubmit={submit}>
                <div className="form-row">
                  <Input label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="Product name" />
                  <Input
                    label="Slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    required
                    placeholder="product-slug"
                    error={slugError || undefined}
                    helper={!slugError ? 'Auto-generated from name. Lowercase letters, numbers and hyphens.' : undefined}
                  />
                </div>
                <div className="form-row">
                  <Input type="select" label="Category" name="category" value={form.category} required onChange={handleChange}>
                    <option value="">No category</option>
                    {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                  </Input>
                  <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" />
                </div>
                <Input label="Description" name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Product description" />
                <Input
                  label="Image URLs (comma-separated)"
                  name="imagesInput"
                  value={form.imagesInput}
                  onChange={handleChange}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
                <div className="form-row">
                  <Input label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange} required min="0" step="0.01" placeholder="0" />
                  <Input label="Discount (%)" name="discount" type="number" value={form.discount} onChange={handleChange} min="0" max="100" placeholder="0" />
                  <Input label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} min="0" placeholder="0" />
                </div>
                <div className="form-row">
                  <Input type="select" label="Stock Status" name="stockStatus" value={form.stockStatus} onChange={handleChange}>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </Input>
                  <Input label="Alcohol %" name="alcohol" value={form.alcohol} onChange={handleChange} placeholder="e.g. 40%" />
                  <Input label="Volume" name="volume" value={form.volume} onChange={handleChange} placeholder="e.g. 750ml" />
                </div>
                <div className="form-row">
                  <Input label="Origin" name="origin" value={form.origin} onChange={handleChange} placeholder="e.g. Scotland" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm transition-colors font-ui" style={{ color: 'var(--warm-silver)' }}>
                    <input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleChange} className="accent-eagle-gold w-4 h-4" />
                    Visible
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm transition-colors font-ui" style={{ color: 'var(--warm-silver)' }}>
                    <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="accent-eagle-gold w-4 h-4" />
                    Featured
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
