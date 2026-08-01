const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  rating: { type: Number, required: true, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'Must be integer' } },
  comment: { type: String, default: '' }
}, { timestamps: true, toJSON: { virtuals: true, transform: (d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } } });

feedbackSchema.statics.getRecent = function (limit = 10) {
  return this.find().sort({ createdAt: -1 }).limit(limit).lean({ virtuals: true });
};

module.exports = mongoose.model('Feedback', feedbackSchema);
