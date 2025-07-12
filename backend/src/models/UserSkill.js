const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Skill = require('./Skill');

const UserSkill = sequelize.define('UserSkill', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('offered', 'wanted'),
    allowNull: false,
  },
});

// Associations
User.belongsToMany(Skill, { through: UserSkill, as: 'skills' });
Skill.belongsToMany(User, { through: UserSkill, as: 'users' });

module.exports = UserSkill;
