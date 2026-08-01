import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, List, ShoppingBag, Settings, ArrowLeft, LogOut,
  Menu, X, Wine
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: List, label: 'Categories' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 lg:hidden"
          style={{
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 220ms ease-out',
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile toggle button in top-left (visible <=1024px when topbar is rendered without margin) */}
      <button
        className="fixed top-3 left-3 z-50 lg:hidden w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: 'rgba(19,19,26,0.9)',
          border: '1px solid var(--glass-border)',
          color: 'var(--eagle-gold)',
        }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        {open ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2} />}
      </button>

      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--eagle-gold), var(--soft-gold))',
              boxShadow: 'var(--shadow-gold-md)',
              color: '#1a1208',
            }}
          >
            <Wine size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <strong>Eagle Shop</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="admin-sidebar-section-label">Management</div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-section-label">System</div>

        <div className="admin-sidebar-footer">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="admin-nav-item"
            style={{ color: 'var(--warm-silver)' }}
          >
            <ArrowLeft size={18} strokeWidth={1.9} />
            <span>Back to Store</span>
          </Link>

          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">{userInitial}</div>
            <div className="min-w-0">
              <strong className="truncate">{user?.name || 'Admin'}</strong>
              <span className="truncate">{user?.email || 'admin@eagleshop.in'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="admin-nav-item"
            style={{ color: 'var(--warm-silver)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-danger)';
              e.currentTarget.style.background = 'rgba(255,107,107,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,107,107,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
              e.currentTarget.style.background = '';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <LogOut size={18} strokeWidth={1.9} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
