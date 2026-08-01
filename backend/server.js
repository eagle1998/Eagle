require('./config/env');
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const settingRoutes = require('./routes/settings');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-eval'", "cdnjs.cloudflare.com", "fonts.googleapis.com"], styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"], fontSrc: ["'self'", "fonts.gstatic.com"], imgSrc: ["'self'", "data:", "images.unsplash.com", "blob:"], connectSrc: ["'self'"] } } }));

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : ['http://localhost:5173'];
app.use(cors({ origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) return cb(null, true); cb(new Error('CORS blocked')); }, credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

const uploadPath = process.env.UPLOAD_PATH || 'uploads';
app.use(`/${uploadPath}`, express.static(path.join(__dirname, uploadPath), { maxAge: '1y', immutable: true, setHeaders: (res) => res.set('Content-Disposition', 'inline') }));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => { const mongoose = require('mongoose'); const states = ['disconnected', 'connected', 'connecting', 'disconnecting']; res.json({ status: 'healthy', database: states[mongoose.connection.readyState] || 'unknown', ts: new Date().toISOString() }); });
app.get('/', (req, res) => res.json({ message: 'Premium Liquor Store API', health: '/api/health' }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  connectDB().then(() => { app.listen(PORT, () => { console.log(`Premium Liquor Store API running on http://localhost:${PORT}`); console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`); }); }).catch((err) => { console.error('Failed to connect to MongoDB:', err.message); process.exit(1); });
} else {
  connectDB().catch((err) => console.error('[vercel] MongoDB connect warning:', err.message));
}

module.exports = app;
