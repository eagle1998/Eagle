require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Category = require('./models/Category');
const StoreSetting = require('./models/StoreSetting');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eagle_beer_shop';

const categories = [
  { name: 'Whisky', slug: 'whisky', description: 'Premium Scotch, Bourbon & Single Malts', sortOrder: 1 },
  { name: 'Vodka', slug: 'vodka', description: 'Premium Vodka from around the world', sortOrder: 2 },
  { name: 'Rum', slug: 'rum', description: 'Dark, White & Spiced Rums', sortOrder: 3 },
  { name: 'Gin', slug: 'gin', description: 'Premium London Dry & Craft Gins', sortOrder: 4 },
  { name: 'Wine', slug: 'wine', description: 'Red, White & Sparkling Wines', sortOrder: 5 },
  { name: 'Beer', slug: 'beer', description: 'Premium Craft & Imported Beers', sortOrder: 6 },
  { name: 'Champagne', slug: 'champagne', description: 'Premium Champagne & Sparkling Wine', sortOrder: 7 }
];

const products = [
  { name: 'Johnnie Walker Black Label', slug: 'johnnie-walker-black', categorySlug: 'whisky', brand: 'Johnnie Walker', price: 3200, discount: 0, stock: 25, alcohol: '40%', volume: '750ml', origin: 'Scotland', images: ['https://images.unsplash.com/photo-1578911595543-4cd0bd7f4d56?w=400'], accent: '#FFD700', isFeatured: true },
  { name: 'Jameson Irish Whiskey', slug: 'jameson-irish', categorySlug: 'whisky', brand: 'Jameson', price: 2500, discount: 10, stock: 30, alcohol: '40%', volume: '750ml', origin: 'Ireland', images: ['https://images.unsplash.com/photo-1578911595543-4cd0bd7f4d56?w=400'], accent: '#C4A35A', isFeatured: false },
  { name: 'Absolut Vodka', slug: 'absolut-vodka', categorySlug: 'vodka', brand: 'Absolut', price: 2200, discount: 0, stock: 40, alcohol: '40%', volume: '750ml', origin: 'Sweden', images: ['https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'], accent: '#1E90FF', isFeatured: true },
  { name: 'Grey Goose', slug: 'grey-goose', categorySlug: 'vodka', brand: 'Grey Goose', price: 4500, discount: 5, stock: 15, alcohol: '40%', volume: '750ml', origin: 'France', images: ['https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'], accent: '#C0C0C0', isFeatured: false },
  { name: 'Bacardi Superior Rum', slug: 'bacardi-superior', categorySlug: 'rum', brand: 'Bacardi', price: 1800, discount: 0, stock: 35, alcohol: '37.5%', volume: '750ml', origin: 'Puerto Rico', images: ['https://images.unsplash.com/photo-1598344575453-3f3117a74e45?w=400'], accent: '#8B4513', isFeatured: true },
  { name: 'Captain Morgan Spiced', slug: 'captain-morgan', categorySlug: 'rum', brand: 'Captain Morgan', price: 2000, discount: 0, stock: 20, alcohol: '35%', volume: '750ml', origin: 'Jamaica', images: ['https://images.unsplash.com/photo-1598344575453-3f3117a74e45?w=400'], accent: '#DAA520', isFeatured: false },
  { name: 'Bombay Sapphire Gin', slug: 'bombay-sapphire', categorySlug: 'gin', brand: 'Bombay Sapphire', price: 2800, discount: 0, stock: 18, alcohol: '40%', volume: '750ml', origin: 'England', images: ['https://images.unsplash.com/photo-1609348955767-3b9d82c6d1e6?w=400'], accent: '#4169E1', isFeatured: true },
  { name: 'Tanqueray Gin', slug: 'tanqueray', categorySlug: 'gin', brand: 'Tanqueray', price: 2600, discount: 15, stock: 0, stockStatus: 'out_of_stock', alcohol: '43.1%', volume: '750ml', origin: 'England', images: ['https://images.unsplash.com/photo-1609348955767-3b9d82c6d1e6?w=400'], accent: '#006400', isFeatured: false },
  { name: 'Jacob\'s Creek Shiraz', slug: 'jacobs-creek-shiraz', categorySlug: 'wine', brand: 'Jacob\'s Creek', price: 1200, discount: 0, stock: 20, alcohol: '13.5%', volume: '750ml', origin: 'Australia', images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'], accent: '#800020', isFeatured: false },
  { name: 'Moët & Chandon Impérial', slug: 'moet-chandon', categorySlug: 'champagne', brand: 'Moët & Chandon', price: 6500, discount: 0, stock: 10, alcohol: '12%', volume: '750ml', origin: 'France', images: ['https://images.unsplash.com/photo-1559251606-c623743a6d76?w=400'], accent: '#FFD700', isFeatured: true },
  { name: 'Heineken Premium Beer', slug: 'heineken', categorySlug: 'beer', brand: 'Heineken', price: 260, discount: 0, stock: 100, alcohol: '5%', volume: '330ml', origin: 'Netherlands', images: ['https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'], accent: '#00843D', isFeatured: false },
  { name: 'Corona Extra', slug: 'corona-extra', categorySlug: 'beer', brand: 'Corona', price: 250, discount: 0, stock: 80, alcohol: '4.5%', volume: '355ml', origin: 'Mexico', images: ['https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'], accent: '#FFB347', isFeatured: false }
];

const storeSettings = {
  storeName: 'Eagle Shop',
  tagline: 'Premium Spirits & Fine Wines',
  description: 'Your premium destination for the finest selection of spirits, wines, and champagnes from around the world.',
  phone: '+91 9594799320',
  whatsappNumber: '+91 9594799320',
  email: 'hello@eagleshop.com',
  address: '17, Khairani Rd, Saki Naka, Mumbai - 400072',
  googleMapsLink: 'https://maps.google.com/?q=17+Khairani+Rd+Saki+Naka+Mumbai+400072',
  coordinates: { lat: 19.0760, lng: 72.8777 },
  businessHours: 'Mon-Sat: 10:00 AM - 10:00 PM | Sun: 12:00 PM - 8:00 PM',
  socialLinks: { instagram: '#', facebook: '#', twitter: '#' },
  deliveryInfo: 'Free delivery on orders above ₹500. Delivery within 30-60 minutes in select areas.',
  heroTitle: 'Premium Spirits, Delivered to Your Doorstep',
  heroSubtitle: 'Curated selection of the world\'s finest whiskies, wines, champagnes & more. Ice cold perfection, every time.',
  aboutSection: 'Eagle Shop is Mumbai\'s premier destination for fine spirits and wines. We curate the world\'s finest labels and deliver them to your doorstep with care.',
  storeDescription: 'Eagle Shop has been serving Mumbai with the finest selection of premium spirits, wines, and champagnes since 2015. We source directly from the world\'s best distilleries and wineries to bring you authentic, high-quality beverages at the best prices.',
  policies: '1. **Age Restriction:** You must be 18+ years to purchase alcohol. We reserve the right to verify age upon delivery.\n2. **Product Availability:** All products are subject to availability. We may substitute with similar products if your choice is unavailable.\n3. **Pricing:** Prices are subject to change without prior notice.\n4. **Delivery:** We deliver within Mumbai metro area only.',
  termsConditions: '1. **Acceptance:** By using Eagle Shop, you accept these terms and conditions.\n2. **Orders:** All orders are subject to confirmation and availability.\n3. **Payment:** Payment must be made at the time of ordering.\n4. **Delivery:** We are not responsible for delays beyond our control.\n5. **Returns:** Once delivered, products cannot be returned or exchanged due to legal restrictions on alcohol sales.',
  privacyPolicy: '1. **Information Collection:** We collect only necessary information to process your orders.\n2. **Data Usage:** Your information is used solely for order processing and delivery.\n3. **Data Protection:** We implement security measures to protect your personal information.\n4. **Third Parties:** We do not share your information with third parties except delivery partners.\n5. **Cookies:** We use essential cookies for website functionality.',
  faq: JSON.stringify([
    { q: 'What is the minimum order amount?', a: 'There is no minimum order amount, but free delivery is available on orders above ₹500.' },
    { q: 'How long does delivery take?', a: 'Delivery typically takes 30-60 minutes within Mumbai.' },
    { q: 'What areas do you deliver to?', a: 'We currently deliver across Mumbai metro area.' },
    { q: 'Do I need to show ID?', a: 'Yes, you must show valid age proof (18+) at the time of delivery.' },
    { q: 'Can I return a product?', a: 'Due to legal restrictions, we cannot accept returns on alcohol products.' }
  ])
};

async function seed() {
  console.log('🌱 Seeding Database...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to MongoDB');
  console.log('Dropping existing data...');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }
  console.log('All collections dropped');

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, { $setOnInsert: cat }, { upsert: true });
  }
  console.log(`Categories: ${categories.length} seeded`);

  const cats = await Category.find().lean();
  const catMap = {};
  for (const c of cats) catMap[c.slug] = c._id;

  let created = 0;
  for (const p of products) {
    const category = catMap[p.categorySlug];
    const { categorySlug, ...productData } = p;
    const result = await Product.findOneAndUpdate(
      { slug: p.slug },
      { $setOnInsert: { ...productData, category, stockStatus: productData.stockStatus || (productData.stock > 10 ? 'in_stock' : productData.stock > 0 ? 'low_stock' : 'out_of_stock') } },
      { upsert: true, new: false }
    );
    if (result === null) created++;
  }
  console.log(`Products: ${created} created`);

  const email = 'admin@premiumcellar.com';
  const existing = await User.findByEmail(email);
  if (!existing) {
    await User.createAdmin({ name: 'Store Admin', email, password: 'Admin@123' });
    console.log(`Admin created: ${email} / Admin@123`);
  } else {
    console.log(`Admin exists: ${email}`);
  }

  for (const [key, value] of Object.entries(storeSettings)) {
    await StoreSetting.set(key, value);
  }
  console.log('Store settings seeded');

  console.log('\n✨ Seeding complete!');
  mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
