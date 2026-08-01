const catchAsync = require('../utils/catchAsync');
const StoreSetting = require('../models/StoreSetting');

const DEFAULTS = Object.freeze({
  storeName: 'Eagle Shop',
  tagline: 'Premium Wines, Whiskies & Spirits',
  email: 'store@eagleshop.in',
  phone: '+91 9594 799 320',
  whatsappNumber: '919594799320',
  address: '17 Khairani Rd, Saki Naka, Andheri East, Mumbai, Maharashtra 400072',
  businessHours: 'Mon – Sun · 10:00 AM – 11:30 PM',
  googleMapsLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10737.44965604418!2d72.8844290968386!3d19.10594905732654!2m3!1f0!2f0!3f3!1m2!1s0x3be7c9efb2442c3f%3A0x5e65e1b33e39c39a!2sEAGLE_BEER_SHOPY!5e0!3m2!1sen!2sin!4v1785425806690!5m2!1sen!2sin',
  heroTitle: 'Glacier-Cold Drinks Delivered in 25 Minutes 🦅',
  heroSubtitle: 'Curated premium wines, whiskies, craft beers and spirits. Picked chilled, delivered fast across Andheri · Powai · Ghatkopar · Kurla.',
  aboutTitle: 'About Eagle Shop',
  aboutSection: 'We are a neighbourhood premium liquor store rooted in Mumbai since 2014. Our promise is simple — every bottle is stored at the perfect serving temperature, handled with care, and delivered to your door in under 30 minutes by a trained team that knows good spirits.',
  storeDescription: 'Eagle Shop is Mumbai’s trusted neighbourhood premium liquor store delivering whisky, wine, craft beer, vodka and spirits in 25 minutes across Andheri, Powai, Ghatkopar and Kurla.',
  deliveryCharge: 50,
  freeDeliveryThreshold: 500,
  deliveryInfo: '• Delivery within 25–30 minutes to Andheri, Powai, Ghatkopar, Kurla (Mumbai).\n• Order value of ₹500+ qualifies for FREE delivery.\n• For orders below ₹500 a flat ₹50 delivery charge applies.\n• All deliveries require age/ID verification at the door (21+).\n• Drink responsibly. Never drink and drive.',
  policies: 'Returns & exchanges: Unopened, sealed bottles may be returned within 2 hours of delivery for a full refund if the seal is intact and there is a manufacturing defect.\nCancellations: You may cancel any order up to 2 minutes after placing it. After dispatch, cancellations are not accepted.\nAge verification: Government-issued photo ID (Aadhaar/PAN/Driving License/Passport) proving age 21+ is mandatory at delivery. We reserve the right to refuse delivery without ID.\nPrice & taxes: All prices are inclusive of applicable state excise and taxes.',
  termsConditions: '1. Acceptance: By placing an order you accept these Terms & Conditions and confirm you are of legal drinking age (21+) in the State of Maharashtra.\n2. Orders: Orders are subject to availability and age/ID verification at delivery. Eagle Shop reserves the right to cancel any order without prior notice if ID verification fails or stock is unavailable.\n3. Pricing: Prices are inclusive of all applicable taxes and duties. Prices may change without notice.\n4. Delivery: Estimated delivery windows are indicative only and not a guarantee. Delays caused by traffic, weather or force majeure do not entitle buyer to refund.\n5. Liability: Maximum liability for any order is capped at the price paid for that order.\n6. Governing law: These terms are governed by the laws of India and courts of Mumbai shall have exclusive jurisdiction.',
  privacyPolicy: 'Effective July 2025. At Eagle Shop we respect your privacy. Information collected (name, phone, delivery address, email) is used solely for order processing, delivery coordination and occasional service updates. We never sell, lease or share customer information with third parties for marketing. Payment data is processed by PCI-DSS compliant payment gateways and never stored on our servers. You may request deletion of your personal data at any time by emailing store@eagleshop.in with "DELETE DATA" in the subject line. Age verification records may be retained for up to 1 year as required by excise regulations.',
  instagram: '',
  facebook: '',
  twitter: '',
  aboutImage: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1000',
  faq: JSON.stringify([
    { q: 'What areas do you deliver to?', a: 'Andheri, Powai, Ghatkopar and Kurla in Mumbai. 25–30 minutes express.' },
    { q: 'Is there a minimum order?', a: 'No minimum order value. Orders below ₹500 are charged a flat ₹50 delivery fee.' },
    { q: 'Do you need ID at the door?', a: 'Yes. Government-issued photo ID proving age 21+ is mandatory by Maharashtra excise law.' },
    { q: 'Can I return a bottle?', a: 'Sealed, unopened bottles with a manufacturing defect may be returned within 2 hours of delivery for a full refund.' },
  ]),
});

let cachedDefaults = null;
function getDefaults() {
  if (cachedDefaults) return cachedDefaults;
  cachedDefaults = { ...DEFAULTS };
  return cachedDefaults;
}

const getSettings = catchAsync(async (req, res) => {
  let result = getDefaults();
  try {
    const docs = await StoreSetting.find().lean();
    if (Array.isArray(docs) && docs.length > 0) {
      for (const d of docs) {
        if (d && typeof d.key === 'string' && d.value !== undefined && d.value !== null) {
          result = { ...result, [d.key]: d.value };
        }
      }
    }
  } catch (err) {
    console.warn('[settings] DB lookup failed, serving defaults:', err.message);
    result = getDefaults();
  }
  res.status(200).json(result);
});

const updateSettings = catchAsync(async (req, res) => {
  const entries = Object.entries(req.body || {}).map(([key, value]) => ({ key, value }));
  if (entries.length === 0) return res.status(400).json({ message: 'No settings provided' });
  try {
    await StoreSetting.bulkSet(entries);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to save settings', error: err.message });
  }
  let merged = getDefaults();
  try {
    const docs = await StoreSetting.find().lean();
    if (Array.isArray(docs)) {
      for (const d of docs) {
        merged = { ...merged, [d.key]: d.value };
      }
    }
  } catch (_) {}
  res.status(200).json({ message: 'Settings updated', settings: merged });
});

module.exports = { getSettings, updateSettings, DEFAULTS };
