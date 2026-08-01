const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;

    // Optionally refresh user data from DB (non-blocking — failure won't crash request)
    try {
      const dbUser = await User.findById(decoded.id).select('id email role createdAt');
      if (dbUser) {
        req.userDb = dbUser;
        // Update role in case it changed since token was issued
        req.user.role = dbUser.role;
      }
    } catch (dbErr) {
      // Non-fatal: proceed with token data
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};

module.exports = { authMiddleware, adminMiddleware };
