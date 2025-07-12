const express = require('express');
const createError = require('http-errors');
const authenticateJWT = require('../middleware/auth');
const { Op } = require('sequelize');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Skill = require('../models/Skill');

const router = express.Router();

// POST /swap-requests – send a swap request
router.post('/', authenticateJWT, async (req, res, next) => {
  try {
    const fromUserId = req.user.id;
    const { toUserId, skillOfferedId, skillWantedId } = req.body;
    if (!toUserId || !skillOfferedId || !skillWantedId) {
      return next(createError(400, 'toUserId, skillOfferedId, and skillWantedId are required'));
    }
    if (toUserId === fromUserId) {
      return next(createError(400, 'Cannot send a request to yourself'));
    }
    // Optional: check no existing pending request
    const existing = await SwapRequest.findOne({
      where: {
        fromUserId,
        toUserId,
        skillOfferedId,
        skillWantedId,
        status: 'pending'
      }
    });
    if (existing) {
      return next(createError(409, 'A pending request already exists'));
    }
    const swap = await SwapRequest.create({ fromUserId, toUserId, skillOfferedId, skillWantedId });
    res.status(201).json({ swap });
  } catch (err) {
    next(err);
  }
});

// GET /swap-requests – list incoming & outgoing for current user
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const swaps = await SwapRequest.findAll({
      where: {
        [Op.or]: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: [
        { model: User, as: 'fromUser', attributes: ['id','name'] },
        { model: User, as: 'toUser',   attributes: ['id','name'] },
        { model: Skill, as: 'skillOffered', attributes: ['id','name'] },
        { model: Skill, as: 'skillWanted',  attributes: ['id','name'] }
      ],
      order: [['createdAt','DESC']]
    });
    res.json({ swaps });
  } catch (err) {
    next(err);
  }
});

// POST /swap-requests/:id/accept – accept a request
router.post('/:id/accept', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const swap = await SwapRequest.findByPk(id);
    if (!swap) return next(createError(404, 'Swap request not found'));
    if (swap.toUserId !== userId) {
      return next(createError(403, 'Only the recipient can accept'));
    }
    if (swap.status !== 'pending') {
      return next(createError(400, 'Cannot accept a non-pending request'));
    }
    swap.status = 'accepted';
    await swap.save();
    res.json({ swap });
  } catch (err) {
    next(err);
  }
});

// POST /swap-requests/:id/reject – reject a request
router.post('/:id/reject', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const swap = await SwapRequest.findByPk(id);
    if (!swap) return next(createError(404, 'Swap request not found'));
    if (swap.toUserId !== userId) {
      return next(createError(403, 'Only the recipient can reject'));
    }
    if (swap.status !== 'pending') {
      return next(createError(400, 'Cannot reject a non-pending request'));
    }
    swap.status = 'rejected';
    await swap.save();
    res.json({ swap });
  } catch (err) {
    next(err);
  }
});

// DELETE /swap-requests/:id – cancel a request (only sender)
router.delete('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const swap = await SwapRequest.findByPk(id);
    if (!swap) return next(createError(404, 'Swap request not found'));
    if (swap.fromUserId !== userId) {
      return next(createError(403, 'Only the sender can cancel'));
    }
    if (swap.status !== 'pending') {
      return next(createError(400, 'Only pending requests can be cancelled'));
    }
    await swap.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
