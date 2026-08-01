import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Plus, Edit3, Trash2, Loader2, List, Search, Bell } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';

const emptyForm = { name: '', slug: '', description: '', isActive: true, sortOrder: 0 };

const slugify = (str) => String(str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const isValidSlug = (slug) => /^[a-z0-9-]+$/.test(slug);

export default function AdminCategoriesPage() {
  const { loading: authLoading, user } = useRedirect();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [slugError, setSlugError] = useState('');

  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  const load = async () => { const d = await api.get('/categories'); setCategories(Array.isArray(d) ? d : []); };

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    load().catch(() => { }).finally(() => setLoading(false));
  }, [authLoading]);

  const filtered = categories.filter(c => !search.trim() ||
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm({ ...emptyForm }); setEditing(null); setError(null); setSuccess(null); setSlugError(''); setAutoSlug(true); setModal(true); };
  const openEdit = (c) => {
    setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', isActive: c.isActive !== false, sortOrder: c.sortOrder || 0 });
    setEditing(c); setError(null); setSuccess(null); setSlugError(''); setAutoSlug(false); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm({ ...emptyForm }); setError(null); setSuccess(null); setSlugError(''); setAutoSlug(true); };
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
        await api.put(`/categories/${editing._id || editing.id}`, payload);
        setSuccess('Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        setSuccess('Category created successfully!');
      }
      setTimeout(() => setSuccess(null), 3000);
      closeModal();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category? Products in this category may become uncategorized.')) return;
    setDeleting(id);
    try {
      await api.delete(`/categories/${id}`);
      await load();
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

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
            <div className="admin-sidebar-user-avatar">{userInitial}</div>
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
          <input
            type="text"
            placeholder="Search categories by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-topbar-actions">
          <button className="btn btn-ghost !w-10 !h-10 shrink-0" type="button" aria-label="Notifications">
            <Bell size={18} strokeWidth={1.9} />
          </button>
          <div className="admin-sidebar-user-avatar">{userInitial}</div>
        </div>
      </div>

      <main className="admin-main">
        <div className="animate-fade-in">
          <header className="page-header">
            <div>
              <h1>Categories</h1>
              <p>
                <span style={{ color: 'var(--eagle-gold)', fontWeight: 600 }}>{categories.length}</span> total
                {filtered.length !== categories.length && ` · ${filtered.length} matching`}
              </p>
            </div>
            <Button icon={Plus} onClick={openCreate}>Add Category</Button>
          </header>

          {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}
          {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

          <div className="glass-card p-3 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="font-ui text-[0.78rem]" style={{ color: 'var(--old-silver)' }}>
              Showing <span style={{ color: 'var(--frost)', fontWeight: 600 }}>{filtered.length}</span> / {categories.length}
            </div>
          </div>

          <div className="table-container has-sticky-header">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Slug</th><th>Status</th><th>Sort Order</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3" style={{ color: 'var(--old-silver)' }}>
                      <List size={42} style={{ opacity: 0.45 }} />
                      <span style={{ fontSize: '1rem', color: 'var(--frost)' }}>No categories yet</span>
                      <span style={{ fontSize: '0.88rem' }}>
                        {search ? 'Try different keywords.' : 'Click "Add Category" to get started.'}
                      </span>
                    </div>
                  </td></tr>
                ) : filtered.map(c => (
                  <tr key={c._id || c.id}>
                    <td className="font-ui font-semibold text-[0.9rem] text-frost">{c.name}</td>
                    <td className="font-mono text-[0.82rem]" style={{ color: 'var(--warm-silver)' }}>{c.slug}</td>
                    <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="font-ui text-[0.82rem] tabular-nums" style={{ color: 'var(--warm-silver)' }}>{c.sortOrder ?? 0}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(c)} title="Edit">
                          <Edit3 size={14} strokeWidth={2} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => remove(c._id || c.id)} title="Delete" disabled={deleting === (c._id || c.id)}>
                          <Trash2 size={14} strokeWidth={2} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Category' : 'New Category'}>
            {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
            <form onSubmit={submit}>
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
              <Input label="Description" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Optional description" />
              <div className="flex items-end gap-6 mb-6">
                <div className="form-group flex-1">
                  <label className="form-label">Sort Order</label>
                  <input name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} className="form-input" min="0" placeholder="0" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm transition-colors font-ui pb-3" style={{ color: 'var(--warm-silver)' }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-eagle-gold w-4 h-4" /> Active
                </label>
              </div>
              <div className="modal-footer-actions flex flex-wrap gap-3 pt-4 border-t border-glass-border" style={{ justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={closeModal} style={{ minWidth: '6.5rem' }}>Cancel</Button>
                <Button type="submit" loading={saving} style={{ minWidth: '9rem' }}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </Modal>
        </div>
      </main>
    </div>
  );
}
