const express = require('express');
const createError = require('http-errors');
const { Parser } = require('json2csv');
const authenticateJWT = require('../middleware/auth');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Message = require('../models/Message');

const router = express.Router();

// Middleware: only admins
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return next(createError(403, 'Admin access required'));
  }
  next();
}

// GET /admin/users — list all users
router.get('/users', authenticateJWT, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id','name','email','location','role','banned','rating','privacyStatus']
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// PUT /admin/users/:id/ban — toggle ban status
router.put('/users/:id/ban', authenticateJWT, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return next(createError(404, 'User not found'));
    user.banned = !user.banned;
    await user.save();
    res.json({ id: user.id, banned: user.banned });
  } catch (err) {
    next(err);
  }
});

// POST /admin/messages — broadcast a message
router.post('/messages', authenticateJWT, requireAdmin, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return next(createError(400, 'Message content required'));
    const msg = await Message.create({ content });
    res.status(201).json({ msg });
  } catch (err) {
    next(err);
  }
});

// GET /messages — public endpoint for all users to fetch broadcasts
router.get('/messages', authenticateJWT, async (req, res, next) => {
  try {
    const messages = await Message.findAll({ order: [['createdAt','DESC']] });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// GET /admin/reports/users — CSV export of users
router.get('/reports/users', authenticateJWT, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({ raw: true });
    const parser = new Parser();
    const csv = parser.parse(users);
    res.header('Content-Type', 'text/csv');
    res.attachment('users_report.csv').send(csv);
  } catch (err) {
    next(err);
  }
});

// GET /admin/reports/swaps — CSV export of swap requests
router.get('/reports/swaps', authenticateJWT, requireAdmin, async (req, res, next) => {
  try {
    const swaps = await SwapRequest.findAll({ raw: true });
    const parser = new Parser();
    const csv = parser.parse(swaps);
    res.header('Content-Type', 'text/csv');
    res.attachment('swaps_report.csv').send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
