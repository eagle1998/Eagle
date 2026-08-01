const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: null },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin'], default: 'admin' }
}, { timestamps: true, toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; delete ret.passwordHash; return ret; } } });

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
};

userSchema.statics.createAdmin = async function ({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return this.create({ name: name || 'Admin', email, passwordHash, role: 'admin' });
};

userSchema.statics.changePassword = async function (id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  return this.findByIdAndUpdate(id, { passwordHash });
};

userSchema.statics.getStats = function () {
  return this.countDocuments();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
