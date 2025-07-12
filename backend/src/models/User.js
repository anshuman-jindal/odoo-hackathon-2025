const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: DataTypes.STRING,
  profilePhoto: DataTypes.STRING,
  availabilityStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  privacyStatus: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});

module.exports = User;
