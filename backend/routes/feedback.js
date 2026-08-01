const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  res.json(await Feedback.getRecent(limit));
});

router.post('/', async (req, res) => {
  const { name, rating, comment } = req.body;
  const fb = await Feedback.create({ name: name || 'Anonymous', rating, comment: comment || '' });
  res.status(201).json(fb.toJSON());
});

module.exports = router;
