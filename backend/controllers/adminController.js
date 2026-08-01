const catchAsync = require('../utils/catchAsync');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const getDashboardStats = catchAsync(async (req, res) => {
  const [productStats, orderStats, totalAdmins] = await Promise.all([
    Product.getStats(),
    Order.getStats(),
    User.getStats()
  ]);
  res.status(200).json({ products: productStats, orders: orderStats, admins: totalAdmins });
});

module.exports = { getDashboardStats };
