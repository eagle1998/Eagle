const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  name: { type: String, required: true },
  image: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  items: { type: [orderItemSchema], required: true, validate: [v => v.length > 0, 'At least one item required'] },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'accepted', 'packed', 'dispatched', 'delivered', 'cancelled', 'rejected'], default: 'pending' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  address: { type: String, required: true },
  notes: { type: String, default: '' },
  paymentMode: { type: String, enum: ['cod', 'upi', 'card'], default: 'cod' }
}, { timestamps: true, toJSON: { virtuals: true, transform: (d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } } });

orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.statics.findAllAdmin = function () {
  return this.find().sort({ createdAt: -1 }).lean({ virtuals: true });
};

orderSchema.statics.getStats = async function () {
  const [total, pending, accepted, packed, dispatched, delivered, cancelled, rejected] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: 'pending' }),
    this.countDocuments({ status: 'accepted' }),
    this.countDocuments({ status: 'packed' }),
    this.countDocuments({ status: 'dispatched' }),
    this.countDocuments({ status: 'delivered' }),
    this.countDocuments({ status: 'cancelled' }),
    this.countDocuments({ status: 'rejected' })
  ]);
  const revenueAgg = await this.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  return { total, pending, accepted, packed, dispatched, delivered, cancelled, rejected, totalRevenue };
};

module.exports = mongoose.model('Order', orderSchema);
