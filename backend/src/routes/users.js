const express = require('express');
const createError = require('http-errors');
const { Op } = require('sequelize');
const authenticateJWT = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');

const router = express.Router();

// GET /users/:id – public (if profile is public) or own profile
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id','name','email','location','profilePhoto','availabilityStatus','privacyStatus','rating','role'],
      include: {
        model: Skill,
        as: 'skills',
        through: { attributes: ['type'] },
      },
    });
    if (!user) return next(createError(404, 'User not found'));

    // privacy check
    if (user.privacyStatus === 'private' && req.user.id !== id && req.user.role !== 'admin') {
      return next(createError(403, 'Profile is private'));
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /users/:id – update own profile
router.put('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized'));
    }
    const { name, location, profilePhoto, availabilityStatus, privacyStatus } = req.body;
    const user = await User.findByPk(id);
    if (!user) return next(createError(404, 'User not found'));

    await user.update({ name, location, profilePhoto, availabilityStatus, privacyStatus });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /users/:id/skills – add a skill
router.post('/:id/skills', authenticateJWT, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return next(createError(403, 'Not authorized'));
    const { name, type } = req.body; // type: 'offered' or 'wanted'
    if (!name || !['offered','wanted'].includes(type)) {
      return next(createError(400, 'Skill name and type (offered/wanted) required'));
    }

    // find or create skill
    const [skill] = await Skill.findOrCreate({ where: { name: { [Op.iLike]: name } }, defaults: { name } });
    // associate
    const entry = await UserSkill.create({ UserId: id, SkillId: skill.id, type });
    res.status(201).json({ skill: skill.name, type, entryId: entry.id });
  } catch (err) {
    next(err);
  }
});

// DELETE /users/:id/skills/:skillId – remove a skill
router.delete('/:id/skills/:skillId', authenticateJWT, async (req, res, next) => {
  try {
    const { id, skillId } = req.params;
    if (req.user.id !== id) return next(createError(403, 'Not authorized'));
    const entry = await UserSkill.findOne({ where: { UserId: id, SkillId: skillId } });
    if (!entry) return next(createError(404, 'Skill entry not found'));
    await entry.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
