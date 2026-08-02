import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Eye, Check, X, Truck, Package, Clipboard, ShoppingBag, Search, Bell } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';

const STATUSES = ['pending', 'accepted', 'packed', 'dispatched', 'delivered', 'cancelled', 'rejected'];

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusIcon = (s) => {
  switch (s) {
    case 'accepted': return <Check size={14} />;
    case 'rejected': return <X size={14} />;
    case 'dispatched': return <Truck size={14} />;
    case 'delivered': return <Package size={14} />;
    default: return null;
  }
};

export default function AdminOrdersPage() {
  const { loading: authLoading, user } = useRedirect();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authLoading) return; load(); }, [authLoading]);

  const viewDetail = (o) => setSelected(o);
  const closeDetail = () => setSelected(null);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(true);
      await api.patch(`/orders/${id}/status`, { status });
      await load();
      if (selected && (selected._id || selected.id) === id) setSelected(prev => prev ? { ...prev, status } : null);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const copyDetails = () => {
    if (!selected) return;
    const id = selected._id || selected.id;
    const text = `Order #${id?.toString().slice(-6)}
Customer: ${selected.customerName || 'N/A'}
Phone: ${selected.customerPhone || 'N/A'}
Email: ${selected.customerEmail || 'N/A'}
Address: ${selected.address || 'N/A'}
Payment: ${selected.paymentMode || 'COD'}
Status: ${selected.status}
Items: ${selected.items?.map(i => `${i.name} x${i.quantity} - \u20B9${i.price}`).join(', ') || 'N/A'}
Total: \u20B9${selected.totalAmount?.toLocaleString() || '0'}
Date: ${selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'N/A'}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => { });
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !search.trim() ||
      (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (o._id || o.id || '').toString().includes(search.toLowerCase()) ||
      (o._id || o.id || '').toString().slice(-6).includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-topbar">
          <div className="admin-search">
            <Search size={16} />
            <input type="text" disabled placeholder="Search orders…" />
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
            placeholder="Search orders by customer, phone, email, or #ID…"
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
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(10,10,15,1)' }}
              />
            )}
          </button>
          <div className="admin-sidebar-user-avatar">{userInitial}</div>
        </div>
      </div>

      <main className="admin-main">
        <div className="animate-fade-in">
          <header className="page-header">
            <div>
              <h1>Orders</h1>
              <p>
                <span style={{ color: 'var(--eagle-gold)', fontWeight: 600 }}>{orders.length}</span> total
                {filteredOrders.length !== orders.length && ` · ${filteredOrders.length} matching`}
              </p>
            </div>
          </header>

          {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

          <div className="glass-card p-3 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3.5 py-1.5 rounded-full font-ui text-[0.72rem] font-bold uppercase tracking-[0.14em] transition-all border ${
                    statusFilter === f.value
                      ? 'bg-gradient-to-r from-eagle-gold to-soft-gold text-deep-obsidian border-eagle-gold'
                      : 'bg-transparent text-warm-silver border-glass-border hover:border-eagle-gold/50 hover:text-eagle-gold'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="font-ui text-[0.78rem]" style={{ color: 'var(--old-silver)' }}>
              Showing <span style={{ color: 'var(--frost)', fontWeight: 600 }}>{filteredOrders.length}</span> / {orders.length}
            </div>
          </div>

          <div className="table-container has-sticky-header">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3" style={{ color: 'var(--old-silver)' }}>
                      <ShoppingBag size={42} style={{ opacity: 0.45 }} />
                      <span style={{ fontSize: '1rem', color: 'var(--frost)' }}>No orders found</span>
                      <span style={{ fontSize: '0.88rem' }}>
                        {search || statusFilter !== 'all' ? 'Try different filters.' : 'Orders will appear here once customers place them.'}
                      </span>
                    </div>
                  </td></tr>
                ) : filteredOrders.map(o => (
                  <tr key={o._id || o.id}>
                    <td className="font-bold font-mono font-ui" style={{ color: 'var(--eagle-gold)' }}>#{(o._id || o.id)?.toString().slice(-6)}</td>
                    <td>
                      <div className="font-ui font-semibold text-[0.88rem] text-frost">{o.customerName || '\u2014'}</div>
                      {o.customerPhone && <div className="font-ui text-[0.72rem] mt-0.5" style={{ color: 'var(--old-silver)' }}>{o.customerPhone}</div>}
                    </td>
                    <td className="font-ui text-[0.82rem]" style={{ color: 'var(--warm-silver)' }}>{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</td>
                    <td className="font-ui font-bold tabular-nums" style={{ color: 'var(--eagle-gold)' }}>₹{Number(o.totalAmount).toLocaleString()}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status?.charAt(0).toUpperCase() + o.status?.slice(1)}</span></td>
                    <td className="font-ui text-[0.82rem] whitespace-nowrap" style={{ color: 'var(--warm-silver)' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '\u2014'}</td>
                    <td>
                      <Button size="sm" variant="secondary" onClick={() => viewDetail(o)} title="View details">
                        <Eye size={14} strokeWidth={2} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal isOpen={!!selected} onClose={closeDetail} title={`Order #${(selected?._id || selected?.id)?.toString().slice(-6) || ''}`} size="lg">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="glass-card p-4">
                  <div className="text-xs uppercase tracking-wider mb-1 font-semibold font-ui" style={{ color: 'var(--old-silver)' }}>Customer</div>
                  <div className="font-semibold text-frost font-ui">{selected?.customerName || 'N/A'}</div>
                  {selected?.customerPhone && <div className="text-sm mt-0.5 font-ui" style={{ color: 'var(--warm-silver)' }}>{selected.customerPhone}</div>}
                  {selected?.customerEmail && <div className="text-sm font-ui" style={{ color: 'var(--warm-silver)' }}>{selected.customerEmail}</div>}
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs uppercase tracking-wider mb-1 font-semibold font-ui" style={{ color: 'var(--old-silver)' }}>Date</div>
                  <div className="font-semibold text-frost font-ui">{selected?.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN') : 'N/A'}</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs uppercase tracking-wider mb-1 font-semibold font-ui" style={{ color: 'var(--old-silver)' }}>Payment</div>
                  <div className="font-semibold text-frost uppercase font-ui">{selected?.paymentMode || 'COD'}</div>
                  {selected?.paymentStatus && <div className="text-sm mt-0.5 font-ui" style={{ color: 'var(--warm-silver)' }}>{selected.paymentStatus}</div>}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider mb-1 font-semibold font-ui" style={{ color: 'var(--old-silver)' }}>Delivery Address</div>
                <div className="p-4 rounded-xl text-sm leading-relaxed font-ui" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--warm-silver)' }}>{selected?.address || 'N/A'}</div>
              </div>

              {selected?.notes && (
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1 font-semibold font-ui" style={{ color: 'var(--old-silver)' }}>Notes</div>
                  <div className="p-4 rounded-xl text-sm font-ui" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--warm-silver)' }}>{selected.notes}</div>
                </div>
              )}

              <div>
                <div className="text-xs uppercase tracking-wider mb-2 font-semibold font-ui" style={{ color: 'var(--old-silver)' }}>Order Items</div>
                <div className="space-y-2">
                  {selected?.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 object-contain rounded-lg" style={{ background: 'var(--deep-obsidian)' }} onError={e => e.target.style.display = 'none'} />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-frost text-sm truncate font-ui">{item.name}</div>
                        <div className="text-xs font-ui" style={{ color: 'var(--old-silver)' }}>Qty: {item.quantity} x ₹{Number(item.price).toLocaleString()}</div>
                      </div>
                      <div className="font-bold text-sm whitespace-nowrap font-ui tabular-nums" style={{ color: 'var(--eagle-gold)' }}>₹{(item.quantity * item.price).toLocaleString()}</div>
                    </div>
                  ))}
                  {(!selected?.items || selected.items.length === 0) && <div className="text-sm py-4 text-center font-ui" style={{ color: 'var(--old-silver)' }}>No items in this order.</div>}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <span className="font-bold text-frost text-lg font-ui">Grand Total</span>
                <span className="font-bold text-eagle-gold text-2xl font-ui tabular-nums">₹{Number(selected?.totalAmount ?? 0).toLocaleString()}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider font-semibold font-ui" style={{ color: 'var(--old-silver)' }}>Update Status</div>
                  <Button size="sm" variant="secondary" onClick={copyDetails} title="Copy details" className="gap-1.5">
                    <Clipboard size={14} /> {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <Button key={s} size="sm" variant={selected?.status === s ? 'primary' : 'secondary'}
                      onClick={() => updateStatus(selected?._id || selected?.id, s)} disabled={updating || selected?.status === s} className="capitalize gap-1.5">
                      {statusIcon(s)} {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}
