import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Plus, Edit3, Trash2, Loader2, List, Search, Bell } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function AdminCategoriesPage() {
  const { loading: authLoading } = useRedirect();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const user = useAuth().user;
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

  const remove = async (id) => {
    if (!window.confirm('Delete this category? Products in this category may become uncategorized.')) return;
    setDeleting(id);
    try {
      await api.delete(`/categories/${id}`);
      await load();
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
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
            <Button icon={Plus} onClick={() => navigate('/admin/categories/new')}>Add Category</Button>
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
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/categories/edit/${c._id || c.id}`)} title="Edit">
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
        </div>
      </main>
    </div>
  );
}
