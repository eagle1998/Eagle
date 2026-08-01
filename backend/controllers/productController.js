const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { z } = require('zod');
const Product = require('../models/Product');

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  category: z.string().optional().nullable(),
  brand: z.string().optional().default(''),
  description: z.string().optional().default(''),
  price: z.number().min(0),
  discount: z.number().min(0).max(100).optional().default(0),
  images: z.array(z.string()).optional().default([]),
  accent: z.string().optional().nullable(),
  stock: z.number().min(0).optional().default(0),
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional().default('in_stock'),
  isVisible: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  alcohol: z.string().optional().default(''),
  volume: z.string().optional().default(''),
  origin: z.string().optional().default('')
});

const updateSchema = productSchema.partial();

const getAllProducts = catchAsync(async (req, res) => {
  const { category } = req.query;
  res.status(200).json(await Product.getAllPublic(category));
});

const getFeatured = catchAsync(async (req, res) => {
  res.status(200).json(await Product.getFeatured());
});

const getAllProductsAdmin = catchAsync(async (req, res) => {
  res.status(200).json(await Product.getAllAdmin());
});

const getProductBySlug = catchAsync(async (req, res) => {
  const product = await Product.findBySlug(req.params.slug);
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(200).json(product);
});

const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug').lean({ virtuals: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(200).json(product);
});

const createProduct = catchAsync(async (req, res) => {
  const data = productSchema.parse(req.body);
  const existing = await Product.findOne({ slug: data.slug });
  if (existing) throw new ApiError(409, 'Product with this slug already exists');
  const product = await Product.create(data);
  res.status(201).json(product.toJSON());
});

const updateProduct = catchAsync(async (req, res) => {
  const data = updateSchema.parse(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate('category', 'name slug').lean({ virtuals: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(200).json(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  const result = await Product.findByIdAndDelete(req.params.id);
  if (!result) throw new ApiError(404, 'Product not found');
  res.status(204).send();
});

const uploadProductImage = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const uploadPath = process.env.UPLOAD_PATH || 'uploads';
  const fullPath = req.file.path.replace(/\\/g, '/');
  const idx = fullPath.indexOf(uploadPath);
  const relativePath = idx !== -1 ? fullPath.substring(idx + uploadPath.length + 1) : req.file.filename;
  const imageUrl = `${req.protocol}://${req.get('host')}/${uploadPath}/${relativePath}`;
  res.status(200).json({ imageUrl, filename: req.file.filename });
});

module.exports = { getAllProducts, getFeatured, getAllProductsAdmin, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, uploadProductImage };
