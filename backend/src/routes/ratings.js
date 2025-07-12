const express = require('express');
const createError = require('http-errors');
const authenticateJWT = require('../middleware/auth');
const SwapRequest = require('../models/SwapRequest');
const Rating = require('../models/Rating');

const router = express.Router();

// POST /ratings/:swapRequestId – submit a rating for a completed swap
router.post('/:swapRequestId', authenticateJWT, async (req, res, next) => {
  try {
    const raterId = req.user.id;
    const { swapRequestId } = req.params;
    const { score, feedbackText } = req.body;

    // Validate input
    if (!score || score < 1 || score > 5) {
      return next(createError(400, 'Score (1–5) is required'));
    }

    // Check swap exists and is accepted
    const swap = await SwapRequest.findByPk(swapRequestId);
    if (!swap) return next(createError(404, 'Swap not found'));
    if (swap.status !== 'accepted') {
      return next(createError(400, 'Can only rate accepted swaps'));
    }

    // Ensure only participants can rate
    const rateeId = swap.fromUserId === raterId ? swap.toUserId : swap.fromUserId;
    if (![swap.fromUserId, swap.toUserId].includes(raterId)) {
      return next(createError(403, 'Not a participant in this swap'));
    }

    // Prevent double-rating
    const existing = await Rating.findOne({ where: { swapRequestId, raterUserId: raterId } });
    if (existing) {
      return next(createError(409, 'You have already rated this swap'));
    }

    // Create rating
    const rating = await Rating.create({
      swapRequestId,
      raterUserId: raterId,
      rateeUserId: rateeId,
      score,
      feedbackText,
    });

    // Update the ratee’s aggregate rating
    const received = await Rating.findAll({ where: { rateeUserId: rateeId } });
    const avg = received.reduce((sum, r) => sum + r.score, 0) / received.length;
    const User = require('../models/User');
    await User.update({ rating: avg }, { where: { id: rateeId } });

    res.status(201).json({ rating });
  } catch (err) {
    next(err);
  }
});

// GET /ratings/user/:userId – list ratings received by a user
router.get('/user/:userId', authenticateJWT, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const ratings = await Rating.findAll({
      where: { rateeUserId: userId },
      order: [['createdAt','DESC']]
    });
    res.json({ ratings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
