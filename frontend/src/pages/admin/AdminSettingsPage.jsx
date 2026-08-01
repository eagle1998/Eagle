import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useRedirect from '../../hooks/useRedirect';
import api from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Save, RotateCcw, Loader2, Search, Bell } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const defaultSettings = {
  storeName: '', tagline: '', email: '', phone: '', whatsappNumber: '',
  address: '', businessHours: '', googleMapsLink: '',
  heroTitle: '', heroSubtitle: '',
  aboutTitle: '', aboutSection: '', storeDescription: '',
  deliveryInfo: '', policies: '', termsConditions: '', privacyPolicy: '',
  deliveryCharge: '', freeDeliveryThreshold: '', faq: '',
  instagram: '', facebook: '', twitter: ''
};

export default function AdminSettingsPage() {
  const { loading: authLoading, user } = useRedirect();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    api.get('/settings').then(d => {
      const data = d || {};
      setSettings({
        storeName: data.storeName || '', tagline: data.tagline || '', email: data.email || '',
        phone: data.phone || '', whatsappNumber: data.whatsappNumber || '',
        address: data.address || '', businessHours: data.businessHours || '',
        googleMapsLink: data.googleMapsLink || '',
        heroTitle: data.heroTitle || '', heroSubtitle: data.heroSubtitle || '',
        aboutTitle: data.aboutTitle || '', aboutSection: data.aboutSection || '', storeDescription: data.storeDescription || '',
        deliveryInfo: data.deliveryInfo || '', policies: data.policies || '',
        termsConditions: data.termsConditions || '', privacyPolicy: data.privacyPolicy || '',
        deliveryCharge: data.deliveryCharge || '', freeDeliveryThreshold: data.freeDeliveryThreshold || '',
        faq: data.faq || '',
        instagram: data.socialLinks?.instagram || data.instagram || '',
        facebook: data.socialLinks?.facebook || data.facebook || '',
        twitter: data.socialLinks?.twitter || data.twitter || ''
      });
    }).catch(() => { }).finally(() => setLoading(false));
  }, [authLoading]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? e.target.checked : value }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/settings', { ...settings, socialLinks: { instagram: settings.instagram, facebook: settings.facebook, twitter: settings.twitter } });
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      setSettings({ ...defaultSettings });
      setSuccess('Settings reset to defaults. Click "Save Changes" to persist.');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-topbar">
          <div className="admin-search">
            <Search size={16} />
            <input type="text" disabled placeholder="Search settings…" />
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
            placeholder="Search settings by field name…"
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
              <h1>Store Settings</h1>
              <p>Manage your store information, policies, and global configuration</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={resetDefaults} title="Reset to defaults" style={{ minWidth: '6.5rem' }}><RotateCcw size={16} /> Reset</Button>
              <Button onClick={save} disabled={saving} icon={Save} loading={saving} style={{ minWidth: '10rem' }}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </header>

          {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}
          {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

          <div className="space-y-10">
            <section className="glass-card p-6">
              <h2 className="font-ui text-[0.98rem] mb-5 pb-3 border-b font-bold tracking-wide flex items-center gap-2" style={{ color: 'var(--eagle-gold)', borderColor: 'var(--glass-border)' }}>
                General
              </h2>
              <div className="form-row">
                <Input label="Store Name" name="storeName" value={settings.storeName} onChange={handleChange} placeholder="Eagle Shop" />
                <Input label="Email" name="email" type="email" value={settings.email} onChange={handleChange} placeholder="store@example.com" />
              </div>
              <Input label="Tagline" name="tagline" value={settings.tagline} onChange={handleChange} placeholder="Premium Wine & Spirits" />
            </section>

            <section className="glass-card p-6">
              <h2 className="font-ui text-[0.98rem] mb-5 pb-3 border-b font-bold tracking-wide flex items-center gap-2" style={{ color: 'var(--eagle-gold)', borderColor: 'var(--glass-border)' }}>
                Contact
              </h2>
              <div className="form-row">
                <Input label="Phone" name="phone" value={settings.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                <Input label="WhatsApp Number" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <Input label="Address" name="address" rows={3} value={settings.address} onChange={handleChange} placeholder="Store address" />
              <div className="form-row">
                <Input label="Business Hours" name="businessHours" value={settings.businessHours} onChange={handleChange} placeholder="Mon-Sat: 10:00 AM - 10:00 PM" />
              </div>
              <Input label="Google Maps Embed URL" name="googleMapsLink" value={settings.googleMapsLink} onChange={handleChange} placeholder="https://www.google.com/maps/embed?pb=..." />
            </section>

            <section className="glass-card p-6">
              <h2 className="font-ui text-[0.98rem] mb-5 pb-3 border-b font-bold tracking-wide flex items-center gap-2" style={{ color: 'var(--eagle-gold)', borderColor: 'var(--glass-border)' }}>
                Hero Section
              </h2>
              <Input label="Hero Title" name="heroTitle" value={settings.heroTitle} onChange={handleChange} placeholder="Welcome to Eagle Shop" />
              <Input label="Hero Subtitle" name="heroSubtitle" rows={3} value={settings.heroSubtitle} onChange={handleChange} placeholder="Discover premium wines and spirits" />
            </section>

            <section className="glass-card p-6">
              <h2 className="font-ui text-[0.98rem] mb-5 pb-3 border-b font-bold tracking-wide flex items-center gap-2" style={{ color: 'var(--eagle-gold)', borderColor: 'var(--glass-border)' }}>
                About & Description
              </h2>
              <Input label="About Title" name="aboutTitle" value={settings.aboutTitle} onChange={handleChange} placeholder="About Eagle Shop" />
              <Input label="About Section" name="aboutSection" rows={4} value={settings.aboutSection} onChange={handleChange} placeholder="About your store..." />
              <Input label="Store Description (SEO)" name="storeDescription" rows={3} value={settings.storeDescription} onChange={handleChange} placeholder="SEO description..." />
            </section>

            <section className="glass-card p-6">
              <h2 className="font-ui text-[0.98rem] mb-5 pb-3 border-b font-bold tracking-wide flex items-center gap-2" style={{ color: 'var(--eagle-gold)', borderColor: 'var(--glass-border)' }}>
                Policies & Info
              </h2>
              <div className="form-row">
                <Input label="Delivery Charge (₹)" name="deliveryCharge" type="number" value={settings.deliveryCharge} onChange={handleChange} placeholder="150" />
                <Input label="Free Delivery Above (₹)" name="freeDeliveryThreshold" type="number" value={settings.freeDeliveryThreshold} onChange={handleChange} placeholder="5000" />
              </div>
              <Input label="Delivery Info" name="deliveryInfo" rows={3} value={settings.deliveryInfo} onChange={handleChange} placeholder="Delivery information..." />
              <Input label="Store Policies" name="policies" rows={3} value={settings.policies} onChange={handleChange} placeholder="Return/refund policies..." />
              <Input label="Terms & Conditions" name="termsConditions" rows={4} value={settings.termsConditions} onChange={handleChange} placeholder="Terms and conditions..." />
              <Input label="Privacy Policy" name="privacyPolicy" rows={4} value={settings.privacyPolicy} onChange={handleChange} placeholder="Privacy policy..." />
            </section>

            <section className="glass-card p-6">
              <h2 className="font-ui text-[0.98rem] mb-5 pb-3 border-b font-bold tracking-wide flex items-center gap-2" style={{ color: 'var(--eagle-gold)', borderColor: 'var(--glass-border)' }}>
                Social Links
              </h2>
              <div className="form-row">
                <Input label="Instagram URL" name="instagram" value={settings.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                <Input label="Facebook URL" name="facebook" value={settings.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
              </div>
              <Input label="Twitter URL" name="twitter" value={settings.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
