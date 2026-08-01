const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { z } = require('zod');
const Feedback = require('../models/Feedback');

const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable()
});

const submitFeedback = catchAsync(async (req, res) => {
  const { rating, comment } = submitFeedbackSchema.parse(req.body);

  const userId = req.user?.id || null;
  const userEmail = req.user?.email || null;

  const fb = await Feedback.createFeedback({ userId, userEmail, rating, comment });

  res.status(201).json({ message: 'Feedback submitted. Thank you!', feedback: fb });
});

const getRecentFeedback = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const feedback = await Feedback.findRecent(limit);
  res.status(200).json(feedback);
});

module.exports = { submitFeedback, getRecentFeedback };
