import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Loader2, Search } from 'lucide-react';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const emptyForm = { name: '', slug: '', description: '', isActive: true, sortOrder: 0 };

const slugify = (str) => String(str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const isValidSlug = (slug) => /^[a-z0-9-]+$/.test(slug);

export default function AdminCategoryFormPage() {
  const { loading: authLoading } = useRedirect();
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [loading, setLoading] = useState(editing);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!editing);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!editing) return;
    (async () => {
      try {
        const data = await api.get('/categories');
        const cats = Array.isArray(data) ? data : [];
        const c = cats.find(x => (x._id || x.id) === id);
        if (!c) {
          setError('Category not found. It may have been deleted.');
          setLoading(false);
          return;
        }
        setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', isActive: c.isActive !== false, sortOrder: c.sortOrder || 0 });
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
      setForm(p => ({ ...p, name: value, slug: slugify(value) }));
      return;
    }
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'slug') setSlugError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSlugError('');
    const slug = slugify(form.slug);
    if (!slug || !isValidSlug(slug)) {
      setSlugError('Slug must contain only lowercase letters, numbers and hyphens (e.g. premium-wines).');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, slug, sortOrder: Number(form.sortOrder) };
      if (editing) {
        await api.put(`/categories/${id}`, payload);
        setSuccess('Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        setSuccess('Category created successfully!');
      }
      setTimeout(() => navigate('/admin/categories'), 900);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save');
      setSaving(false);
    }
  };

  const goBack = () => navigate('/admin/categories');

  if (authLoading || loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-topbar">
          <div className="admin-search">
            <Search size={16} />
            <input type="text" disabled placeholder="Search categories…" />
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
          <input type="text" placeholder="Search categories…" readOnly />
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
                <Button type="button" variant="secondary" icon={ArrowLeft} onClick={goBack} title="Back to categories">
                  Back
                </Button>
                <div className="min-w-0">
                  <h1>{editing ? 'Edit Category' : 'New Category'}</h1>
                  <p>{editing ? `Editing category #${id}` : 'Create a new category'}</p>
                </div>
              </div>
              <div className="admin-form-actions">
                <Button type="button" variant="secondary" onClick={goBack}>Cancel</Button>
                <Button type="submit" form="category-form" loading={saving} style={{ minWidth: '9rem' }}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>

            <div className="admin-form-body">
              {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}
              {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

              <form id="category-form" onSubmit={submit}>
                <div className="form-row">
                  <Input label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="Category name" />
                  <Input
                    label="Slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    required
                    placeholder="category-slug"
                    error={slugError || undefined}
                    helper={!slugError ? 'Auto-generated from name. Lowercase letters, numbers and hyphens.' : undefined}
                  />
                </div>
                <Input label="Description" name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Optional description" />
                <div className="flex items-end gap-6">
                  <div className="form-group flex-1">
                    <label className="form-label">Sort Order</label>
                    <input name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} className="form-input" min="0" placeholder="0" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm transition-colors font-ui pb-3" style={{ color: 'var(--warm-silver)' }}>
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-eagle-gold w-4 h-4" /> Active
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
