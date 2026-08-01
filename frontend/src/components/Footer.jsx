import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Mail, Phone, ChevronRight } from 'lucide-react';
import logo from '../assets/logo.png';
import Modal from './ui/Modal';
import api from '../services/api';

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Categories', href: '#categories' },
  { label: 'Products', href: '#products' },
  { label: 'About Us', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

function parseFaq(faq) {
  if (!faq) return [];
  if (Array.isArray(faq)) return faq;
  try { return JSON.parse(faq); } catch { return []; }
}

function renderPolicyContent(content) {
  if (!content) return 'Content for this section is not yet available.';

  return content.split('\n').map((line, index) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={`${line}-${index}`} className="mb-3 last:mb-0">
        {parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
          }
          return <span key={partIndex}>{part}</span>;
        })}
      </p>
    );
  });
}

export default function Footer({
  settings = {},
}) {
  const [policy, setPolicy] = useState(null);
  const [remoteSettings, setRemoteSettings] = useState({});
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      fetchedRef.current = true;
      setRemoteSettings({});
      return;
    }
    if (fetchedRef.current) return;

    fetchedRef.current = true;
    api.get('/settings')
      .then((data) => setRemoteSettings(data || {}))
      .catch(() => setRemoteSettings({}));
  }, [settings]);

  const resolvedSettings = Object.keys(settings).length > 0 ? settings : remoteSettings;
  const policies = [
    { id: 'terms', label: 'Terms & Conditions', content: resolvedSettings.termsConditions || 'No terms configured yet.' },
    { id: 'privacy', label: 'Privacy Policy', content: resolvedSettings.privacyPolicy || 'No privacy policy configured yet.' },
    { id: 'delivery', label: 'Delivery & Returns', content: resolvedSettings.deliveryInfo || 'No delivery info configured yet.' },
    { id: 'storePolicies', label: 'Store Policies', content: resolvedSettings.policies || 'No store policies configured yet.' },
  ];
  const active = policies.find(p => p.id === policy);
  const faqItems = parseFaq(resolvedSettings.faq);

  const copy = (e, hash) => {
    if (window.location.pathname !== '/') return;
    e.preventDefault();
    const el = document.querySelector(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container-x relative z-10">
        <div className="footer-grid">
          {/* Column 1: Company */}
          <div className="footer-brand">
            <Link to="/" className="footer-brand-logo no-underline">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
                style={{ borderColor: 'var(--glass-border)', background: 'rgba(10,10,15,0.6)' }}
              >
                <img src={logo} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <strong>{resolvedSettings.storeName || 'Eagle Shop'}</strong>
              </div>
            </Link>
            <p>
              {resolvedSettings.aboutSection || resolvedSettings.storeDescription ||
                'Your trusted destination for premium wines, whiskies, spirits, and beers. Curated with passion, delivered with care.'}
            </p>
            <div className="footer-socials">
              {resolvedSettings.instagram && (
                <a href={resolvedSettings.instagram} target="_blank" rel="noreferrer noopener" className="footer-social-link" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
              )}
              {resolvedSettings.facebook && (
                <a href={resolvedSettings.facebook} target="_blank" rel="noreferrer noopener" className="footer-social-link" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.25.2 2.25.2v2.48h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" /></svg>
                </a>
              )}
              {resolvedSettings.twitter && (
                <a href={resolvedSettings.twitter} target="_blank" rel="noreferrer noopener" className="footer-social-link" aria-label="Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              )}
              {resolvedSettings.whatsappNumber && (
                <a href={`https://wa.me/${String(resolvedSettings.whatsappNumber).replace(/\D/g, '')}`} target="_blank" rel="noreferrer noopener" className="footer-social-link" aria-label="WhatsApp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.11 17.2c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.32-.8-.7-1.34-1.56-1.49-1.82-.15-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.61-1.47-.83-2.02-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.71.34-.25.27-.94.92-.94 2.24 0 1.32.97 2.6 1.1 2.77.14.18 1.9 2.9 4.6 4.06.64.28 1.14.44 1.53.57.64.2 1.22.17 1.68.1.51-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" /><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.2h.01c5.45 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm0 17.8h-.01a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.11.82.83-3.03-.2-.31a8 8 0 0 1-1.23-4.2c0-4.42 3.6-8.01 8.02-8.01 2.14 0 4.14.83 5.65 2.34a8 8 0 0 1 2.34 5.67c0 4.43-3.6 8.04-8.01 8.04z" /></svg>
                </a>
              )}
            </div>
          </div>



          {/* Column 3: Contact */}
          <div className="footer-col">
            <h4>Contact</h4>
            {resolvedSettings.address && (
              <div className="footer-contact-item">
                <MapPin size={16} strokeWidth={2} />
                <address>{resolvedSettings.address}</address>
              </div>
            )}
            {(resolvedSettings.phone || resolvedSettings.whatsappNumber) && (
              <div className="footer-contact-item">
                <Phone size={16} strokeWidth={2} />
                <span>{resolvedSettings.phone || resolvedSettings.whatsappNumber}</span>
              </div>
            )}
            {resolvedSettings.email && (
              <div className="footer-contact-item">
                <Mail size={16} strokeWidth={2} />
                <span>{resolvedSettings.email}</span>
              </div>
            )}
            {resolvedSettings.businessHours && (
              <div className="footer-contact-item">
                <Clock size={16} strokeWidth={2} />
                <span>{resolvedSettings.businessHours}</span>
              </div>
            )}
          </div>

          {/* Column 4: Policies */}
          <div className="footer-col">
            <h4>Policies</h4>
            <ul className="footer-links">
              {policies.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPolicy(p.id)}
                    className="!list-none !cursor-pointer bg-transparent border-0 p-0 text-left"
                  >
                    {p.label}
                  </button>
                </li>
              ))}

            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} <span>{resolvedSettings.storeName || 'Eagle Shop'}.</span> All rights reserved. For persons 18 years of age or older.
          </p>
          <span className="footer-age-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            18+ Only
          </span>
        </div>

        <div className="footer-credit">
          <p>
            Created by <span> </span>
            <a
              href="https://github.com/codedbymithlesh"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
            > CodeByMithlesh
            </a>
          </p>
        </div>
      </div>

      <Modal
        isOpen={!!active || policy === 'faq'}
        onClose={() => setPolicy(null)}
        title={policy === 'faq' ? 'Frequently Asked Questions' : active?.label || ''}
        size="lg"
      >
        {policy === 'faq' ? (
          <div className="space-y-3">
            {faqItems.length > 0 ? (
              faqItems.map((f, i) => (
                <details key={i} className="glass-card" style={{ padding: '1rem 1.25rem' }}>
                  <summary className="cursor-pointer font-ui font-semibold text-base" style={{ color: 'var(--frost)' }}>
                    {f.q}
                  </summary>
                  <p className="mt-2 font-ui text-sm leading-relaxed" style={{ color: 'var(--warm-silver)', margin: 0 }}>{f.a}</p>
                </details>
              ))
            ) : (
              <p className="text-center py-6 font-ui" style={{ color: 'var(--warm-silver)' }}>
                No FAQs configured yet.
              </p>
            )}
          </div>
        ) : (
          <div
            className="font-body leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--warm-silver)', fontSize: '1.05rem' }}
          >
            {renderPolicyContent(active?.content)}
          </div>
        )}
      </Modal>
    </footer>
  );
}
