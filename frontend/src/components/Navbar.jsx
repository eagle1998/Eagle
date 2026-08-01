import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

const NAV_LINKS = [
  { label: 'Home', hash: '#home' },
  { label: 'Products', hash: '#products' },
  { label: 'About', hash: '#about' },
  { label: 'Contact', hash: '#contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const cart = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname, location.hash]);

  const scrollToSection = (hash) => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const cartCount = cart?.count ?? 0;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl border-b border-glass-border shadow-[0_8px_30px_rgba(0,0,0,0.25)] py-3'
          : 'bg-transparent py-5'
      }`}
      style={scrolled ? { backgroundColor: 'rgba(10, 10, 15, 0.78)' } : {}}
    >
      <div className="container-x">
        <nav className="flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Eagle Shop Home">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-glass-border bg-deep-obsidian/60 shrink-0">
              <img src={logo} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <strong className="font-heading text-[1.28rem] font-black tracking-tight text-gradient">
                Eagle Shop
              </strong>
              <span className="font-ui text-[0.6rem] tracking-[0.2em] uppercase font-bold text-old-silver mt-0.5">
                Premium Liquor Store
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center justify-center gap-7">
            {NAV_LINKS.map((l) => (
              <a
                key={l.hash}
                href={l.hash}
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    scrollToSection(l.hash);
                  }
                }}
                className="nav-link"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Cart"
              aria-controls="cart-drawer"
              aria-expanded={false}
              className="relative btn btn-ghost !w-11 !h-11 shrink-0"
              onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="cart-badge tabular-nums">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {user && (
              <>
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex btn btn-ghost !w-11 !h-11 shrink-0"
                  aria-label="Admin"
                >
                  <User size={20} strokeWidth={2} />
                </Link>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex btn btn-md btn-secondary shrink-0"
                >
                  <LogIn size={16} className="rotate-180" />
                  Logout
                </button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
              className="btn btn-ghost !w-11 !h-11 shrink-0 lg:hidden"
            >
              {menuOpen ? <X size={22} strokeWidth={2.25} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="fixed inset-x-3 top-[82px] z-40 lg:hidden animate-fade-in"
            style={{
              background: 'linear-gradient(180deg, rgba(26,14,18,0.98), rgba(10,10,15,0.98))',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border-strong)',
              borderRadius: 20,
              padding: '1rem 1rem 1.25rem',
              boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
            }}
          >
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((l, i) => (
                <a
                  key={l.hash}
                  href={l.hash}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    setTimeout(() => scrollToSection(l.hash), 100);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-ui text-sm font-semibold tracking-wide"
                  style={{ color: 'var(--warm-silver)' }}
                >
                  <span
                    aria-hidden="true"
                    className="w-6 text-right font-mono font-bold tabular-nums"
                    style={{ color: 'var(--eagle-gold)', opacity: 0.85 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {l.label}
                </a>
              ))}
            </nav>

            {user && (
              <div className="mt-4 pt-4 border-t border-glass-border flex flex-col gap-2">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-ui font-extrabold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--eagle-gold), var(--matte-gold))',
                      color: '#1a1208',
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-ui font-semibold text-sm text-frost truncate">{user.name}</div>
                    <div className="font-ui text-xs text-old-silver truncate">{user.email}</div>
                  </div>
                </div>
                <button onClick={logout} className="btn btn-secondary w-full justify-center">
                  <LogIn size={16} className="rotate-180" />
                  Logout
                </button>
              </div>
            )}

            <p
              className="mt-4 text-center font-ui font-bold uppercase tracking-[0.18em]"
              style={{ fontSize: '0.62rem', color: 'var(--old-silver)' }}
            >
              For those 18 and older. Drink responsibly.
            </p>
          </div>
        </>
      )}
    </header>
  );
}
