import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard, MessageCircle } from 'lucide-react';
import Drawer from './ui/Drawer';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';

export default function CartDrawer({ settings = {} }) {
  const cart = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', notes: '',
  });

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('open-cart', h);
    return () => window.removeEventListener('open-cart', h);
  }, []);

  useEffect(() => { if (!open) { setTimeout(() => setCheckout(false), 250); } }, [open]);

  const subtotal = cart?.total ?? 0;
  const deliveryCharge = settings.deliveryCharge !== undefined && settings.deliveryCharge !== '' ? Number(settings.deliveryCharge) : 150;
  const freeThreshold = settings.freeDeliveryThreshold !== undefined && settings.freeDeliveryThreshold !== '' ? Number(settings.freeDeliveryThreshold) : 5000;
  const delivery = subtotal > 0 && subtotal < freeThreshold ? deliveryCharge : 0;
  const grand = subtotal + delivery;

  const updateQty = (id, delta) => {
    const item = cart?.items?.find(i => (i._id || i.id) === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) cart.remove(id);
    else cart.updateQty(id, newQty);
  };

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    try {
      const { default: api } = await import('../services/api');
      const settings = await api.get('/settings').catch(() => ({}));
      const number = settings?.whatsappNumber || settings?.phone || '919594799320';
      const storeName = settings?.storeName || 'Eagle Shop';

      let msg = `*New Order — ${storeName}*\n\n`;
      msg += `*Customer Details*\n`;
      msg += `Name: ${form.name}\n`;
      msg += `Phone: ${form.phone}\n`;
      if (form.email) msg += `Email: ${form.email}\n`;
      msg += `Delivery Address: ${form.address}\n\n`;
      
      msg += `*Products*\n\n`;
      cart.items.forEach(i => {
        const cat = typeof i.category === 'object' && i.category ? i.category.name : (i.category || 'Unknown');
        msg += `- ${i.name}\n`;
        if (i.brand) msg += `  Brand: ${i.brand}\n`;
        msg += `  Category: ${cat}\n`;
        const price = i.discount > 0 ? i.price - Math.round(i.price * i.discount / 100) : i.price;
        msg += `  Quantity: ${i.quantity}\n`;
        msg += `  Price: ₹${price.toLocaleString()}\n\n`;
      });
      
      msg += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
      msg += `Delivery Charge: ${delivery === 0 ? 'FREE' : `₹${delivery.toLocaleString()}`}\n`;
      msg += `Grand Total: ₹${grand.toLocaleString()}\n`;
      
      if (form.notes) msg += `\nSpecial Notes: ${form.notes}`;

      const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      
      cart.clear();
      setOpen(false);
      navigate('/');
    } catch (err) {
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <>
      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        side="right"
        width="lg"
        ariaLabel="Cart"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-glass-border shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.18), rgba(212,160,23,0.04))', border: '1px solid var(--glass-border)' }}
            >
              <ShoppingBag size={22} strokeWidth={2} style={{ color: 'var(--eagle-gold)' }} />
              {cart.count > 0 && (
                <span className="cart-badge tabular-nums">{cart.count > 99 ? '99+' : cart.count}</span>
              )}
            </div>
            <div>
              <h2 className="font-heading font-extrabold tracking-tight text-xl" style={{
                background: 'linear-gradient(135deg, var(--eagle-gold), var(--soft-gold))',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>
                Your Cart
              </h2>
              <p className="font-ui text-xs mt-0.5" style={{ color: 'var(--old-silver)' }}>
                {cart.count} {cart.count === 1 ? 'item' : 'items'} ready to order
              </p>
            </div>
          </div>
          <button className="btn btn-ghost !w-10 !h-10" onClick={() => setOpen(false)} aria-label="Close cart">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {cart.count === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              variant="default"
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse our collection and add your favorite bottles to get started."
              actionLabel="Continue Shopping"
              actionOnClick={() => setOpen(false)}
            />
          </div>
        ) : checkout ? (
          <form onSubmit={placeOrder} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div
                className="flex items-start justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-ui text-xs font-bold uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--eagle-gold)' }}>
                    Order Summary
                  </div>
                  <div className="space-y-2 font-ui text-sm">
                    {cart.items.map((i) => {
                      const id = i._id || i.id;
                      return (
                        <div key={id} className="flex items-center justify-between gap-3 py-1">
                          <span className="truncate" style={{ color: 'var(--warm-silver)' }}>
                            <span className="tabular-nums" style={{ color: 'var(--old-silver)' }}>{i.quantity}×</span>{' '}
                            {i.name}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums" style={{ color: 'var(--frost)' }}>
                            ₹{(i.price * i.quantity).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckout(false)}
                  className="btn btn-sm btn-secondary shrink-0"
                >
                  Edit
                </button>
              </div>

              <Input label="Full Name" name="name" value={form.name} onChange={onChange} required placeholder="John Doe" />
              <Input label="Phone Number" name="phone" value={form.phone} onChange={onChange} required placeholder="+91 98765 43210" />
              <Input label="Email (optional)" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
              <Input label="Delivery Address" name="address" rows={3} value={form.address} onChange={onChange} required placeholder="House, Street, City, PIN" />
              <Input label="Special Notes (optional)" name="notes" rows={2} value={form.notes} onChange={onChange} placeholder="Gate code, delivery time, etc." />
            </div>

            <div
              className="shrink-0 px-6 py-5 border-t border-glass-border space-y-3"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(10,10,15,0.5))' }}
            >
              <div className="space-y-1.5 font-ui text-sm">
                <div className="flex justify-between" style={{ color: 'var(--warm-silver)' }}>
                  <span>Subtotal</span><span className="tabular-nums" style={{ color: 'var(--frost)' }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[0.92rem] text-old-silver font-ui">
                  <span>Delivery {subtotal > 0 && subtotal >= freeThreshold ? '(FREE)' : ''}</span>
                  <span className="tabular-nums" style={{ color: delivery === 0 ? 'var(--color-success)' : 'var(--frost)' }}>
                    {delivery === 0 ? 'FREE' : `₹${delivery.toLocaleString()}`}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between pt-3 mt-3 border-t border-glass-border"
                >
                  <span className="font-bold uppercase tracking-[0.12em] text-xs" style={{ color: 'var(--eagle-gold)' }}>
                    Grand Total
                  </span>
                  <span
                    className="font-ui font-extrabold text-2xl tracking-tight tabular-nums"
                    style={{
                      background: 'linear-gradient(135deg, var(--eagle-gold), var(--soft-gold))',
                      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    }}
                  >
                    ₹{grand.toLocaleString()}
                  </span>
                </div>
              </div>
              <Button type="submit" size="lg" icon={CreditCard} className="w-full justify-center mt-2">
                Place Order
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {cart.items.map((i) => {
                const id = i._id || i.id;
                const price = i.discount > 0 ? i.price - Math.round(i.price * i.discount / 100) : i.price;
                const lineTotal = price * i.quantity;
                return (
                  <div
                    key={id}
                    className="flex items-stretch gap-3 p-3 rounded-xl transition-colors"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  >
                    <div
                      className="w-14 h-14 shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                      style={{ background: 'rgba(10,10,15,0.55)', border: '1px solid var(--glass-border)' }}
                    >
                      {i.images?.[0] ? (
                        <img src={i.images[0]} alt="" className="w-full h-full object-contain" onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <ShoppingBag size={18} style={{ color: 'var(--old-silver)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-ui font-semibold text-sm leading-snug truncate" style={{ color: 'var(--frost)' }}>
                            {i.name}
                          </div>
                          {i.brand && (
                            <div className="font-ui text-xs mt-0.5" style={{ color: 'var(--old-silver)' }}>{i.brand}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label="Remove item"
                          className="btn btn-ghost !w-8 !h-8 shrink-0 hover:!text-red-400 hover:!bg-red-500/10"
                          onClick={() => cart.remove(id)}
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </div>
                      <div className="flex items-end justify-between gap-3 mt-2">
                        <div
                          className="inline-flex items-center shrink-0 rounded-full"
                          style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid var(--glass-border)' }}
                        >
                          <button
                            type="button"
                            aria-label="Decrease"
                            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:text-eagle-gold disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => updateQty(id, -1)}
                            disabled={i.quantity <= 1}
                            style={{ color: 'var(--warm-silver)' }}
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="w-7 text-center font-ui font-bold tabular-nums text-sm" style={{ color: 'var(--frost)' }}>
                            {i.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase"
                            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:text-eagle-gold"
                            onClick={() => updateQty(id, 1)}
                            style={{ color: 'var(--warm-silver)' }}
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                        <div className="text-right">
                          {i.discount > 0 && (
                            <div className="font-ui text-xs" style={{ color: 'var(--old-silver)', textDecoration: 'line-through' }}>
                              ₹{(i.price * i.quantity).toLocaleString()}
                            </div>
                          )}
                          <div className="font-ui font-extrabold tabular-nums leading-tight" style={{ color: 'var(--eagle-gold)' }}>
                            ₹{lineTotal.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="shrink-0 px-6 py-5 border-t border-glass-border space-y-4"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(10,10,15,0.5))' }}
            >
              <div className="space-y-1.5 font-ui text-sm">
                <div className="flex justify-between items-center" style={{ color: 'var(--warm-silver)' }}>
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--frost)' }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center" style={{ color: 'var(--warm-silver)' }}>
                  <span>
                    Delivery Charge
                    {subtotal > 0 && subtotal < freeThreshold && (
                      <span className="block text-xs" style={{ color: 'var(--old-silver)' }}>
                        Free on orders over ₹{freeThreshold.toLocaleString()}
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums font-semibold" style={{ color: delivery === 0 ? 'var(--color-success)' : 'var(--frost)' }}>
                    {delivery === 0 ? 'FREE' : `₹${delivery.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-glass-border">
                  <span className="font-bold uppercase tracking-[0.12em] text-xs" style={{ color: 'var(--eagle-gold)' }}>
                    Grand Total
                  </span>
                  <span
                    className="font-ui font-extrabold text-2xl tracking-tight tabular-nums"
                    style={{
                      background: 'linear-gradient(135deg, var(--eagle-gold), var(--soft-gold))',
                      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    }}
                  >
                    ₹{grand.toLocaleString()}
                  </span>
                </div>
              </div>
              <Button size="lg" onClick={() => setCheckout(true)} icon={CreditCard} className="w-full justify-center">
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* Order via WhatsApp modal (unused but kept for backwards API compatibility) */}
      <Modal isOpen={false} onClose={() => {}} title="Order Placed" size="sm" />
    </>
  );
}
