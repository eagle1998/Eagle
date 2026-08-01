import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart, Phone, Plus, Minus, ChevronRight, Truck, ShieldCheck, Clock,
  MapPin, MessageCircle, Compass, Wine, Award, CheckCircle2,
  Star, Package, ArrowRight, AlertTriangle, Droplets, FlaskConical, Globe2
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import CartDrawer from '../components/CartDrawer';

const DEFAULT_MAP =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10737.44965604418!2d72.8844290968386!3d19.10594905732654!2m3!1f0!2f0!3f3!1m2!1s0x3be7c9efb2442c3f%3A0x5e65e1b33e39c39a!2sEAGLE_BEER_SHOPY!5e0!3m2!1sen!2sin!4v1785425806690!5m2!1sen!2sin';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1578911595543-4cd0bd7f4d56?w=800';
const ABOUT_FALLBACK = 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1000';

const POLICIES = [
  { key: 'privacyPolicy', label: 'Privacy Policy', icon: ShieldCheck },
  { key: 'termsConditions', label: 'Terms & Conditions', icon: Package },
  { key: 'deliveryInfo', label: 'Delivery Info', icon: Truck },
];

const CATEGORY_ICONS = {
  Whisky: '🥃', Wine: '🍷', Beer: '🍺', Vodka: '🍸', Rum: '🥃', Gin: '🌿',
  Champagne: '🥂', Tequila: '🌵', Brandy: '🍷', Cognac: '🥃', Liquor: '🍾',
};

function parseFaq(faq) {
  if (!faq) return [];
  if (Array.isArray(faq)) return faq;
  try { return JSON.parse(faq); } catch { return []; }
}

export default function HomePage() {
  const { cartItems, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState(null);
  const [aboutImgError, setAboutImgError] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/products').then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
      api.get('/categories/active').then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
      api.get('/settings').then((d) => d || {}).catch(() => ({})),
      api.get('/feedback?limit=4').then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
    ]).then(([prods, cats, set, fb]) => {
      setProducts(prods);
      setCategories(cats);
      setSettings(set);
      setFeedback(fb);
      setLoading(false);
    });
    const handler = () => setCartOpen(true);
    window.addEventListener('open-cart', handler);
    return () => window.removeEventListener('open-cart', handler);
  }, []);

  const storeName = settings.storeName || 'Eagle Shop';
  const deliveryInfo = settings.deliveryInfo || 'Free delivery on orders above ₹500.';
  const mapUrl = settings.googleMapsLink || DEFAULT_MAP;

  const displayPrice = (p) => (p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price);
  const isInStock = (p) => p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock';

  const productCountByCat = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cid = typeof p.category === 'object' && p.category ? p.category._id || p.category.id : p.category;
      if (cid) counts[cid] = (counts[cid] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!filter) return products;
    return products.filter((p) => {
      const cid = typeof p.category === 'object' && p.category ? p.category._id || p.category.id : p.category;
      return cid === filter;
    });
  }, [products, filter]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <section className="hero">
          <div className="hero-bg" />
          <div className="container-x">
            <div className="hero-grid">
              <div>
                <Skeleton className="w-32 h-5 mb-6 rounded-full" />
                <Skeleton className="h-20 w-full mb-6 rounded-xl" />
                <Skeleton className="h-5 w-3/4 mb-3 rounded" />
                <Skeleton className="h-5 w-2/3 mb-8 rounded" />
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-44 rounded-full" />
                  <Skeleton className="h-14 w-40 rounded-full" />
                </div>
              </div>
              <div>
                <Skeleton className="aspect-[4/5] w-full rounded-[28px]" />
              </div>
            </div>
          </div>
        </section>
        <section className="section-padding">
          <div className="container-x">
            <Skeleton className="h-10 w-56 mx-auto mb-12 rounded" />
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card">
                  <Skeleton className="aspect-[16/9] w-full rounded-t-[22px]" />
                  <div className="p-5 flex flex-col gap-3">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-5 w-full rounded" />
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <div className="flex items-end justify-between pt-3">
                      <Skeleton className="h-6 w-20 rounded" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container-x">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <span className="eyebrow">Premium Spirits & Fine Wines</span>
            <h1 className="mb-6 leading-[1.05]">
              Premium Spirits,
              <br />
              <span className="text-gradient">Delivered to Your Doorstep</span>
            </h1>
            <p className="hero-subtitle !max-w-2xl mx-auto text-center" style={{ marginBottom: '2.5rem' }}>
              Curated selection of the world's finest whiskies, wines, champagnes & more. Ice cold perfection, every time.
            </p>
            <div className="hero-cta justify-center">
              <Button
                as="a"
                href="#products"
                size="lg"
                icon={ArrowRight}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Collection
              </Button>
              <Button
                as="a"
                href={`tel:${settings.phone || '+919594799320'}`}
                variant="secondary"
                size="lg"
                icon={Phone}
              >
                Call to Order
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="section-padding pt-0">
        <div className="container-x">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              { icon: Truck, title: 'Express Delivery', desc: 'Free delivery on orders above ₹500. Delivery within 30-60 minutes in select areas.' },
              { icon: ShieldCheck, title: '100% Authentic', desc: 'Every bottle sourced from official distributors and verified.' },
              { icon: Clock, title: 'Ice Cold Delivery', desc: 'Stored and delivered at the perfect serving temperature.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="feature-card glass-card flex flex-col items-center text-center">
                <div className="feature-icon"><Icon size={26} strokeWidth={1.8} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PRODUCTS ====== */}
      <section id="products" className="section-padding">
        <div className="container-x">
          <div className="section-header">
            <span className="eyebrow">Collection</span>
            <h2>Our Premium Products</h2>
            <p>Handpicked selection of the finest spirits, wines, and beverages from around the globe.</p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button
                type="button"
                onClick={() => setFilter(null)}
                className={`px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                  filter === null
                    ? 'bg-gradient-to-r from-eagle-gold to-soft-gold text-deep-obsidian border-eagle-gold shadow-[0_6px_20px_rgba(212,160,23,0.25)]'
                    : 'bg-transparent text-warm-silver border-glass-border hover:border-eagle-gold/50 hover:text-eagle-gold'
                }`}
              >
                All Products
              </button>
              {categories.map((c) => {
                const id = c._id || c.id;
                const active = filter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(active ? null : id)}
                    className={`px-4 py-2 rounded-full font-ui text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                      active
                        ? 'bg-gradient-to-r from-eagle-gold to-soft-gold text-deep-obsidian border-eagle-gold shadow-[0_6px_20px_rgba(212,160,23,0.25)]'
                        : 'bg-transparent text-warm-silver border-glass-border hover:border-eagle-gold/50 hover:text-eagle-gold'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try a different category or check back soon for new arrivals."
              action
              onAction={() => setFilter(null)}
              actionLabel="View All Products"
            />
          ) : (
            <div className="products-grid">
              {filteredProducts.map((p) => {
                const id = p._id || p.id;
                const price = displayPrice(p);
                const inStock = isInStock(p);
                const cat = typeof p.category === 'object' && p.category ? p.category.name : '';
                const lowStock = p.stockStatus === 'low_stock';
                return (
                  <div key={id} className="product-card">
                    <div className="product-image-wrap">
                      <img
                        src={p.images?.[0] || FALLBACK_IMG}
                        alt={p.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      />
                    </div>
                    <div className="product-badges">
                      {p.discount > 0 && <Badge variant="danger">-{p.discount}%</Badge>}
                      {p.isFeatured && <Badge variant="warning">Featured</Badge>}
                    </div>
                    <div className="product-badges-right">
                      {!inStock && <Badge variant="danger">Out of Stock</Badge>}
                      {lowStock && inStock && <Badge variant="warning">Low Stock</Badge>}
                      {inStock && !lowStock && <Badge variant="success">In Stock</Badge>}
                    </div>
                    <div className="product-body">
                      {cat && <span className="product-category-label">{cat}</span>}
                      <h3 className="product-title">{p.name}</h3>
                      {p.brand && <div className="font-ui text-[0.82rem] mt-1 mb-2" style={{ color: 'var(--old-silver)' }}>Brand: {p.brand}</div>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.alcohol && (
                          <Badge variant="alcohol">
                            <Droplets size={12} strokeWidth={2.5} />
                            {p.alcohol.includes('%') ? p.alcohol : `${p.alcohol}%`}
                            <span style={{ opacity: 0.7, marginLeft: 1, fontWeight: 700 }}>ABV</span>
                          </Badge>
                        )}
                        {p.volume && (
                          <Badge variant="volume">
                            <FlaskConical size={12} strokeWidth={2.5} />
                            {p.volume}
                          </Badge>
                        )}
                        {p.origin && (
                          <Badge variant="origin">
                            <Globe2 size={12} strokeWidth={2.5} />
                            {p.origin}
                          </Badge>
                        )}
                      </div>
                      <div className="product-meta">
                        <div className="product-price-group">
                          <span className="product-price">₹{Number(price).toFixed(0)}</span>
                          {p.discount > 0 && (
                            <span className="product-price-old">₹{Number(p.price).toFixed(0)}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="product-add-btn"
                          onClick={() => addToCart(p)}
                          disabled={!inStock}
                          aria-label={`Add ${p.name} to cart`}
                        >
                          <Plus size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ====== ABOUT ====== */}
      <section id="about" className="section-padding">
        <div className="container-x">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <div className="about-content flex flex-col items-center w-full">
              <span className="eyebrow">About Us</span>
              <h2 className="mb-6">
                {settings.aboutTitle || (
                  <>
                    A Legacy of <span className="text-gradient">Fine Spirits</span>
                  </>
                )}
              </h2>
              <div className="space-y-4 mb-10 text-lg">
                {settings.aboutSection ? (
                  <p>{settings.aboutSection}</p>
                ) : (
                  <p>
                    {storeName} is your premier destination for curated fine spirits and wines.
                    With over four decades of expertise and a passion for quality, we bring you the
                    world's most celebrated labels, carefully selected and delivered at the perfect
                    temperature.
                  </p>
                )}
                {settings.storeDescription && (
                  <p className="text-frost/90">{settings.storeDescription}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
                {[
                  { icon: CheckCircle2, title: '100% Authentic Products', desc: 'Every bottle verified from official sources.' },
                  { icon: Truck, title: 'Fast & Secure Delivery', desc: 'Temperature-controlled vehicles for peak freshness.' },
                  { icon: Star, title: 'Expert Curated Selection', desc: 'Handpicked by sommeliers and connoisseurs.' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(212, 160, 23, 0.1)', color: 'var(--eagle-gold)' }}>
                      <Icon size={24} strokeWidth={1.8} />
                    </div>
                    <strong className="font-ui text-[1.05rem] text-frost mb-2">{title}</strong>
                    <span className="font-ui text-[0.9rem] text-old-silver">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEEDBACK ====== */}
      {feedback.length > 0 && (
        <section className="section-padding pt-0">
          <div className="container-x">
            <div className="section-header">
              <span className="eyebrow">Testimonials</span>
              <h2>What Our Customers Say</h2>
              <p>Trusted by thousands of happy connoisseurs across the city.</p>
            </div>
            <div className="features-grid">
              {feedback.slice(0, 4).map((fb) => (
                <div key={fb._id || fb.id} className="glass-card p-6 flex flex-col gap-4 h-full">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < (fb.rating || 5) ? 'var(--eagle-gold)' : 'none'}
                        color={i < (fb.rating || 5) ? 'var(--eagle-gold)' : 'var(--old-silver)'}
                        strokeWidth={i < (fb.rating || 5) ? 0 : 1.75}
                      />
                    ))}
                  </div>
                  <p className="text-frost/92 text-[1rem] leading-relaxed flex-1 italic font-body">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-glass-border">
                    <div className="font-ui font-semibold text-eagle-gold text-sm">{fb.name || 'Anonymous'}</div>
                    <div className="font-ui text-xs text-old-silver mt-0.5">Verified Customer</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== STORE / LOCATION ====== */}
      <section id="contact" className="section-padding">
        <div className="container-x">
          <div className="section-header">
            <span className="eyebrow">Visit Us</span>
            <h2>Our Store Location</h2>
            <p>Visit our flagship store for premium recommendations and fast local service.</p>
          </div>
          <div className="store-grid">
            <div className="store-info-block">
              {settings.address && (
                <div className="store-info-card glass-card">
                  <div className="store-info-icon">
                    <MapPin size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3>Address</h3>
                    <address>{settings.address}</address>
                  </div>
                </div>
              )}
              {settings.businessHours && (
                <div className="store-info-card glass-card">
                  <div className="store-info-icon">
                    <Clock size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3>Opening Hours</h3>
                    <p>{settings.businessHours}</p>
                  </div>
                </div>
              )}
              {(settings.phone || settings.whatsappNumber) && (
                <div className="store-info-card glass-card">
                  <div className="store-info-icon">
                    <Phone size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3>Contact</h3>
                    {settings.phone && <p><a href={`tel:${settings.phone}`}>{settings.phone}</a></p>}
                    {settings.whatsappNumber && (
                      <p><a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp: {settings.whatsappNumber}</a></p>
                    )}
                  </div>
                </div>
              )}
              <div className="store-info-actions">
                {settings.phone && (
                  <Button as="a" href={`tel:${settings.phone}`} size="md" icon={Phone}>
                    Call Store
                  </Button>
                )}
                {settings.whatsappNumber && (
                  <Button
                    as="a"
                    href={`https://wa.me/${settings.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    size="md"
                    icon={MessageCircle}
                  >
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
            <div className="store-map">
              <iframe
                src={mapUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${storeName} Location`}
              />
            </div>
          </div>
        </div>
      </section>



      <CartDrawer settings={settings} />

      <Modal
        isOpen={!!policyModal}
        onClose={() => setPolicyModal(null)}
        title={POLICIES.find((p) => p.key === policyModal)?.label}
        size="lg"
      >
        <div className="text-frost/95 leading-relaxed whitespace-pre-line max-h-[60vh] overflow-y-auto pr-2 text-[0.98rem]">
          {settings[policyModal] || 'Content for this section is not yet available.'}
        </div>
      </Modal>

    </div>
  );
}
