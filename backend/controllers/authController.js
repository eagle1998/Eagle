const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), secretKey: z.string() });
const changePasswordSchema = z.object({ currentPassword: z.string(), newPassword: z.string().min(6) });

const signToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  config.jwt.secret,
  { expiresIn: config.jwt.expiresIn }
);

const register = catchAsync(async (req, res) => {
  const { name, email, password, secretKey } = registerSchema.parse(req.body);
  
  if (secretKey !== config.adminRegisterSecret) {
    throw new ApiError(403, 'Invalid Admin Registration Key.');
  }

  const existing = await User.findByEmail(email);
  if (existing) throw new ApiError(409, 'Admin with this email already exists');
  const user = await User.createAdmin({ name, email, password });
  const token = signToken(user);
  res.status(201).json({ message: 'Admin created', token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new ApiError(401, 'Invalid email or password');
  const token = signToken(user);
  res.status(200).json({ message: 'Login successful', token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

const verify = catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ valid: false, error: 'No token' });
  try {
    const decoded = jwt.verify(authHeader.substring(7), config.jwt.secret);
    res.status(200).json({ valid: true, user: decoded });
  } catch { res.status(401).json({ valid: false, error: 'Invalid or expired token' }); }
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new ApiError(401, 'Current password is incorrect');
  await User.changePassword(user._id, newPassword);
  res.status(200).json({ message: 'Password changed successfully' });
});

module.exports = { register, login, verify, changePassword };
