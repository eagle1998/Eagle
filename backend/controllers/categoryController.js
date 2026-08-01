const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { z } = require('zod');
const Category = require('../models/Category');

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().default(''),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0)
});

const getAllCategories = catchAsync(async (req, res) => {
  res.status(200).json(await Category.getAll());
});

const getActiveCategories = catchAsync(async (req, res) => {
  res.status(200).json(await Category.getActive());
});

const createCategory = catchAsync(async (req, res) => {
  const data = categorySchema.parse(req.body);
  const existing = await Category.findOne({ slug: data.slug });
  if (existing) throw new ApiError(409, 'Category with this slug already exists');
  const category = await Category.create(data);
  res.status(201).json(category.toJSON());
});

const updateCategory = catchAsync(async (req, res) => {
  const data = categorySchema.partial().parse(req.body);
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).lean({ virtuals: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(200).json(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  const result = await Category.findByIdAndDelete(req.params.id);
  if (!result) throw new ApiError(404, 'Category not found');
  res.status(204).send();
});

module.exports = { getAllCategories, getActiveCategories, createCategory, updateCategory, deleteCategory };
