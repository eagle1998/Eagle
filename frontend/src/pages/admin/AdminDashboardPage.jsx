import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Skeleton from '../../components/ui/Skeleton';
import {
  Package, ShoppingBag, AlertTriangle, DollarSign, Users, TrendingUp,
  Layers, Settings, ArrowRight, Search, Bell, Eye
} from 'lucide-react';

const GOLD = 'var(--eagle-gold)';
const SUCCESS = '#43e97b';
const DANGER = '#ff6b6b';
const INFO = '#3b82f6';
const PURPLE = '#a855f7';
const WARNING = '#FFB347';

function StatCard({ icon: Icon, title, value, sub, color }) {
  return (
    <div className="stat-card glass-card">
      <div
        className="stat-card-icon"
        style={{
          background: `${color}14`,
          color,
        }}
      >
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="stat-card-label">{title}</div>
        <div className="stat-card-value tabular-nums">{value ?? '—'}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { to: '/admin/products', label: 'Manage Products', desc: 'Add, edit, and organize your catalog', icon: Package, color: GOLD },
  { to: '/admin/categories', label: 'Manage Categories', desc: 'Organize categories and their order', icon: Layers, color: INFO },
  { to: '/admin/settings', label: 'Store Settings', desc: 'Configure store info and policies', icon: Settings, color: WARNING },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { loading: authLoading } = useRedirect();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    Promise.all([
      api.get('/admin/stats').catch(() => null),
      api.get('/orders').catch(() => []),
      api.get('/products/manage').catch(() => []),
    ]).then(([s, o, p]) => {
      setStats(s || {});
      setOrders(Array.isArray(o) ? o : []);
      setProducts(Array.isArray(p) ? p : []);
      setLoading(false);
    });
  }, [authLoading]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const lowStock = useMemo(
    () => products.filter((p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock').slice(0, 6),
    [products]
  );

  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  if (authLoading || loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-topbar">
          <div className="admin-search">
            <Search size={16} />
            <input type="text" placeholder="Search anything…" disabled />
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-ghost !w-10 !h-10" disabled>
              <Bell size={18} />
            </button>
            <div className="admin-sidebar-user-avatar">{userInitial}</div>
          </div>
        </div>
        <main className="admin-main">
          <div className="animate-fade-in">
            <header className="page-header">
              <div>
                <Skeleton className="h-9 w-48 rounded" />
                <Skeleton className="h-4 w-80 mt-3 rounded" />
              </div>
              <Skeleton className="h-10 w-36 rounded-full" />
            </header>

            <div className="stats-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="stat-card glass-card">
                  <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-3 w-36 rounded" />
                  </div>
                </div>
              ))}
            </div>

            <section className="mb-10 mt-8">
              <Skeleton className="h-3 w-28 mb-4 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
                <Skeleton className="h-5 w-44 rounded" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="flex flex-col">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-glass-border last:border-b-0">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-56 max-w-full rounded" />
                      <Skeleton className="h-3 w-32 rounded" />
                    </div>
                    <div className="text-right space-y-2 shrink-0">
                      <Skeleton className="h-4 w-16 ml-auto rounded" />
                      <Skeleton className="h-3 w-20 ml-auto rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const p = stats?.products || {};
  const o = stats?.orders || {};
  const filtered = search.trim() ? [...recentOrders, ...lowStock.map((lp) => ({ __low: true, ...lp }))].filter((x) => (x.name || x.customerName || '').toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      {/* ===== Topbar ===== */}
      <div className="admin-topbar">
        <div className="admin-search">
          <Search size={16} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search products, orders, customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-topbar-actions">
          <button
            type="button"
            className="btn btn-ghost !w-10 !h-10 shrink-0 relative"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.9} />
            {(o.pending || 0) > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(10,10,15,1)' }}
              />
            )}
          </button>
          <div className="admin-sidebar-user-avatar">{userInitial}</div>
        </div>
      </div>

      {/* ===== Main ===== */}
      <main className="admin-main">
        <div className="animate-fade-in">
          <header className="page-header">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back, <span style={{ color: 'var(--eagle-gold)', fontWeight: 600 }}>{user?.name || 'Admin'}</span> — here's how your store is performing today.</p>
            </div>
            <div className="flex gap-2">
              <NavLink to="/admin/products" className="btn btn-md btn-secondary">
                <Package size={15} /> Products
              </NavLink>
            </div>
          </header>

          {/* ===== Stats Grid ===== */}
          <div className="stats-grid">
            <StatCard
              icon={Package}
              title="Total Products"
              value={p.total}
              color={GOLD}
              sub={`${p.total || 0} items in catalog`}
            />
            <StatCard
              icon={TrendingUp}
              title="In Stock"
              value={p.inStock}
              color={SUCCESS}
              sub={`${p.lowStock || 0} low stock items`}
            />
            <StatCard
              icon={AlertTriangle}
              title="Out of Stock"
              value={p.outOfStock}
              color={DANGER}
              sub={`${p.total ? Math.round(((p.outOfStock || 0) / p.total) * 100) : 0}% of catalog`}
            />

          </div>

          {/* ===== Quick Actions ===== */}
          <section className="mb-10">
            <div
              className="font-ui text-[0.72rem] font-bold uppercase tracking-[0.22em] mb-4"
              style={{ color: 'var(--old-silver)' }}
            >
              Quick Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_ACTIONS.map(({ to, label, desc, icon: Icon, color }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="glass-card p-5 flex flex-col gap-3 no-underline group"
                  style={{ transition: 'all 300ms cubic-bezier(0.22,1,0.36,1)' }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${color}14`,
                      color,
                      border: `1px solid ${color}22`,
                      transition: 'all 250ms ease',
                    }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="font-ui font-semibold text-[0.95rem] flex items-center gap-2 text-frost">
                      {label}
                      <ArrowRight
                        size={14}
                        strokeWidth={2.5}
                        style={{
                          color: 'var(--eagle-gold)',
                          opacity: 0,
                          transform: 'translateX(-6px)',
                          transition: 'all 250ms ease',
                        }}
                        className="group-[&]:opacity-100 group-[&]:translate-x-0"
                      />
                    </div>
                    <div className="font-ui text-[0.8rem] mt-1 leading-relaxed" style={{ color: 'var(--old-silver)' }}>
                      {desc}
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </section>

          {/* ===== Recent Orders / Low Stock ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">


            {/* Low Stock / Inventory Alerts */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} strokeWidth={1.9} style={{ color: 'var(--color-warning)' }} />
                  <h3 className="font-heading text-[1.1rem] m-0">Inventory Alerts</h3>
                </div>
                <NavLink to="/admin/products" className="btn btn-sm btn-secondary">
                  Manage <Eye size={13} strokeWidth={2.2} />
                </NavLink>
              </div>
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {lowStock.length === 0 ? (
                  <div className="py-14 text-center font-ui text-sm" style={{ color: 'var(--old-silver)' }}>
                    <TrendingUp size={40} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--color-success)' }} />
                    All products are well-stocked. Cheers! 🥂
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {lowStock.map((lp) => {
                      const id = lp._id || lp.id;
                      const out = lp.stockStatus === 'out_of_stock';
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 px-5 py-3.5 border-b border-glass-border last:border-b-0"
                          style={{ transition: 'background 150ms ease' }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: out ? 'rgba(255,107,107,0.08)' : 'rgba(255,191,0,0.08)',
                              border: `1px solid ${out ? 'rgba(255,107,107,0.2)' : 'rgba(255,191,0,0.2)'}`,
                              color: out ? 'var(--color-danger)' : 'var(--color-warning)',
                            }}
                          >
                            <Package size={17} strokeWidth={2} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-ui font-semibold text-[0.88rem] text-frost truncate">{lp.name}</div>
                            <div className="font-ui text-[0.72rem] mt-0.5" style={{ color: 'var(--old-silver)' }}>
                              {typeof lp.category === 'object' ? lp.category?.name : (lp.categoryName || 'Uncategorized')}
                              {lp.brand ? ` · ${lp.brand}` : ''}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-ui font-bold tabular-nums" style={{ color: out ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                              {out ? 'Out' : `Low · ${lp.stock ?? 0}`}
                            </div>
                            <div className="font-ui text-[0.72rem] tabular-nums mt-0.5" style={{ color: 'var(--eagle-gold)' }}>
                              ₹{Number(lp.price || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {filtered && (
            <div className="mt-6 glass-card p-5">
              <div className="font-ui text-[0.78rem] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--eagle-gold)' }}>
                Search Results
              </div>
              {filtered.length === 0 ? (
                <p className="font-ui text-sm" style={{ color: 'var(--old-silver)' }}>No matches for "{search}".</p>
              ) : (
                <ul className="font-ui text-sm space-y-2">
                  {filtered.slice(0, 10).map((x, i) => (
                    <li key={i} className="text-frost">
                      • {x.__low ? (x.name || 'Product') : `Order #${String(x._id || x.id).slice(-6)} · ${x.customerName || 'Customer'}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
