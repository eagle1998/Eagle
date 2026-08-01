const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true, transform: (d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } } });

categorySchema.statics.getAll = async function () {
  return this.find().sort({ sortOrder: 1, name: 1 }).lean({ virtuals: true });
};

categorySchema.statics.getActive = async function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean({ virtuals: true });
};

module.exports = mongoose.model('Category', categorySchema);
