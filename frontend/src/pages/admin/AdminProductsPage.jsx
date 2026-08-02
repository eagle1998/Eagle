import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Plus, Edit3, Trash2, Loader2, ImageOff, Package, Search, Bell,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function AdminProductsPage() {
  const { loading: authLoading } = useRedirect();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const user = useAuth().user;
  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    api.get('/products/manage').then(d => { setProducts(Array.isArray(d) ? d : []); }).catch(() => { }).finally(() => setLoading(false));
  }, [authLoading]);

  const filteredProducts = products.filter(p => {
    const matchSearch = !search.trim() || (
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (typeof p.category === 'object' ? p.category?.name || '' : (p.categoryName || '')).toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter === 'all' || p.stockStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const remove = async (id) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      setSuccess('Product deleted successfully!');
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
            <input type="text" disabled placeholder="Search products…" />
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
            placeholder="Search products by name, brand, or category…"
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
              <h1>Products</h1>
              <p>
                <span style={{ color: 'var(--eagle-gold)', fontWeight: 600 }}>{products.length}</span> total
                {filteredProducts.length !== products.length && ` · ${filteredProducts.length} matching`}
              </p>
            </div>
            <Button icon={Plus} onClick={() => navigate('/admin/products/new')}>Add Product</Button>
          </header>

          {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}
          {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

          {/* Filters */}
          <div className="glass-card p-3 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { v: 'all', l: 'All' },
                { v: 'in_stock', l: 'In Stock' },
                { v: 'low_stock', l: 'Low Stock' },
                { v: 'out_of_stock', l: 'Out of Stock' },
              ].map(f => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => setStatusFilter(f.v)}
                  className={`px-3.5 py-1.5 rounded-full font-ui text-[0.72rem] font-bold uppercase tracking-[0.14em] transition-all border ${
                    statusFilter === f.v
                      ? 'bg-gradient-to-r from-eagle-gold to-soft-gold text-deep-obsidian border-eagle-gold'
                      : 'bg-transparent text-warm-silver border-glass-border hover:border-eagle-gold/50 hover:text-eagle-gold'
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
            <div className="font-ui text-[0.78rem]" style={{ color: 'var(--old-silver)' }}>
              Showing <span style={{ color: 'var(--frost)', fontWeight: 600 }}>{filteredProducts.length}</span> / {products.length}
            </div>
          </div>

          <div className="table-container has-sticky-header">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 240 }}>Product</th>
                  <th className="hidden md:table-cell">Category</th>
                  <th>Price</th>
                  <th className="hidden md:table-cell">Stock</th>
                  <th className="hidden lg:table-cell">Status</th>
                  <th className="hidden xl:table-cell">Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3" style={{ color: 'var(--old-silver)' }}>
                        <Package size={42} style={{ opacity: 0.45 }} />
                        <span style={{ fontSize: '1rem', color: 'var(--frost)' }}>No products found</span>
                        <span style={{ fontSize: '0.88rem' }}>
                          {search || statusFilter !== 'all' ? 'Try different filters.' : 'Click "Add Product" to create your first product.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.map(p => {
                  const id = p._id || p.id;
                  const cat = typeof p.category === 'object' && p.category ? p.category.name : p.categoryName || '';
                  return (
                    <tr key={id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                          >
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-full h-full object-contain"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <ImageOff size={16} style={{ color: 'var(--old-silver)' }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-ui font-semibold text-[0.9rem] text-frost truncate max-w-[280px]">
                              {p.name}
                            </div>
                            {p.brand && <div className="font-ui text-[0.72rem] mt-0.5" style={{ color: 'var(--old-silver)' }}>{p.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="font-ui text-[0.82rem] hidden md:table-cell" style={{ color: 'var(--warm-silver)' }}>{cat || '—'}</td>
                      <td className="font-ui font-bold tabular-nums" style={{ color: 'var(--eagle-gold)' }}>
                        ₹{Number(p.price || 0).toLocaleString()}
                      </td>
                      <td className="font-ui text-[0.82rem] tabular-nums hidden md:table-cell" style={{ color: 'var(--warm-silver)' }}>
                        {p.stock ?? 0}
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className={`badge badge-${p.stockStatus === 'in_stock' ? 'success' : p.stockStatus === 'low_stock' ? 'warning' : 'danger'}`}>
                          {p.stockStatus === 'in_stock' ? 'In Stock' : p.stockStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="hidden xl:table-cell">
                        <div className="flex gap-1.5 flex-wrap">
                          {!p.isVisible && <span className="badge badge-danger">Hidden</span>}
                          {p.isFeatured && <span className="badge badge-success">Featured</span>}
                          {p.isVisible && !p.isFeatured && <span className="badge badge-info">Visible</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/products/edit/${id}`)} title="Edit">
                            <Edit3 size={14} strokeWidth={2} />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => remove(id)} title="Delete" disabled={deleting === id}>
                            <Trash2 size={14} strokeWidth={2} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
