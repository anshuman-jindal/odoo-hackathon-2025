const express = require('express');
const createError = require('http-errors');
const { Op } = require('sequelize');
const authenticateJWT = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');

const router = express.Router();

// GET /search/skills?q=term  – autocomplete skill names
router.get('/skills', authenticateJWT, async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const skills = await Skill.findAll({
      where: { name: { [Op.iLike]: `%${q}%` } },
      limit: 10,
      order: [['name', 'ASC']],
    });
    res.json({ skills });
  } catch (err) {
    next(err);
  }
});

// GET /search/users?skill=Photoshop&type=offered
// – find users who offer or want a given skill
router.get('/users', authenticateJWT, async (req, res, next) => {
  try {
    const { skill, type = 'offered' } = req.query;
    if (!skill) {
      return next(createError(400, 'Query parameter `skill` is required'));
    }
    const skillInstance = await Skill.findOne({
      where: { name: { [Op.iLike]: skill } }
    });
    if (!skillInstance) {
      return res.json({ users: [] });
    }
    const userSkills = await UserSkill.findAll({
      where: { SkillId: skillInstance.id, type },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id','name','location','profilePhoto','rating']
        }
      ]
    });
    const users = userSkills.map(us => us.User);
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
