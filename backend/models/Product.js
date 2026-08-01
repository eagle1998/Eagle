const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  brand: { type: String, trim: true, default: '' },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  images: [{ type: String }],
  accent: { type: String, default: null },
  stock: { type: Number, default: 0, min: 0 },
  stockStatus: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
  isVisible: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  alcohol: { type: String, default: '' },
  volume: { type: String, default: '' },
  origin: { type: String, default: '' }
}, { timestamps: true, toJSON: { virtuals: true, transform: (d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } } });

productSchema.virtual('discountedPrice').get(function () {
  return this.discount > 0 ? Math.round(this.price * (1 - this.discount / 100)) : this.price;
});

productSchema.virtual('in_stock').get(function () {
  return this.stockStatus === 'in_stock' || this.stockStatus === 'low_stock';
});

productSchema.index({ category: 1, stockStatus: 1 });
productSchema.index({ isVisible: 1, isFeatured: 1 });

productSchema.statics.getAllPublic = async function (category) {
  const filter = { isVisible: true, stockStatus: { $ne: 'out_of_stock' } };
  if (category) filter.category = category;
  return this.find(filter).sort({ isFeatured: -1, createdAt: -1 }).populate('category', 'name slug').lean({ virtuals: true });
};

productSchema.statics.getAllAdmin = function () {
  return this.find().sort({ createdAt: -1 }).populate('category', 'name slug').lean({ virtuals: true });
};

productSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isVisible: true }).populate('category', 'name slug').lean({ virtuals: true });
};

productSchema.statics.getFeatured = function () {
  return this.find({ isVisible: true, isFeatured: true, stockStatus: { $ne: 'out_of_stock' } }).populate('category', 'name slug').lean({ virtuals: true });
};

productSchema.statics.getStats = async function () {
  const [total, inStock, lowStock, outOfStock, featured] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ stockStatus: 'in_stock' }),
    this.countDocuments({ stockStatus: 'low_stock' }),
    this.countDocuments({ stockStatus: 'out_of_stock' }),
    this.countDocuments({ isFeatured: true })
  ]);
  return { total, inStock, lowStock, outOfStock, featured };
};

module.exports = mongoose.model('Product', productSchema);
