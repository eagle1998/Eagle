const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { z } = require('zod');
const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })).min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().optional().default(''),
  customerEmail: z.string().optional().default(''),
  address: z.string().min(5),
  notes: z.string().optional().default(''),
  paymentMode: z.enum(['cod', 'upi', 'card']).optional().default('cod')
});

const updateStatusSchema = z.object({ status: z.enum(['pending', 'accepted', 'packed', 'dispatched', 'delivered', 'cancelled', 'rejected']) });

const createOrder = catchAsync(async (req, res) => {
  const { items, customerName, customerPhone, customerEmail, address, notes, paymentMode } = createOrderSchema.parse(req.body);
  const orderItems = [];
  let totalAmount = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId).lean();
    if (!product) throw new ApiError(404, `Product ${item.productId} not found`);
    if (product.stockStatus === 'out_of_stock') throw new ApiError(400, `"${product.name}" is out of stock`);
    if (!product.isVisible) throw new ApiError(400, `"${product.name}" is not available`);
    const price = product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price;
    totalAmount += price * item.quantity;
    orderItems.push({ productId: product._id, name: product.name, image: product.images?.[0] || null, quantity: item.quantity, price });
  }
  const order = await Order.create({ items: orderItems, totalAmount, customerName, customerPhone, customerEmail, address, notes, paymentMode, status: 'pending' });
  res.status(201).json({ message: 'Order created', orderId: order._id, totalAmount, status: 'pending' });
});

const getAllOrders = catchAsync(async (req, res) => {
  res.status(200).json(await Order.findAllAdmin());
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).lean({ virtuals: true });
  if (!order) throw new ApiError(404, 'Order not found');
  res.status(200).json(order);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = updateStatusSchema.parse(req.body);
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean({ virtuals: true });
  if (!order) throw new ApiError(404, 'Order not found');
  res.status(200).json({ message: 'Status updated', order });
});

const deleteOrder = catchAsync(async (req, res) => {
  const result = await Order.findByIdAndDelete(req.params.id);
  if (!result) throw new ApiError(404, 'Order not found');
  res.status(204).send();
});

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder };
