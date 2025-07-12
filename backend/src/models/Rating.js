const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const SwapRequest = require('./SwapRequest');
const User = require('./User');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  feedbackText: DataTypes.TEXT,
});

// Associations
SwapRequest.hasOne(Rating, { foreignKey: 'swapRequestId', as: 'rating' });
Rating.belongsTo(SwapRequest, { foreignKey: 'swapRequestId' });
User.hasMany(Rating, { foreignKey: 'raterUserId', as: 'givenRatings' });
User.hasMany(Rating, { foreignKey: 'rateeUserId', as: 'receivedRatings' });
Rating.belongsTo(User, { foreignKey: 'raterUserId', as: 'rater' });
Rating.belongsTo(User, { foreignKey: 'rateeUserId', as: 'ratee' });

module.exports = Rating;
