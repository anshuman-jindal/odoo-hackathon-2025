const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Skill = require('./Skill');

const SwapRequest = sequelize.define('SwapRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
});

// Associations
User.hasMany(SwapRequest, { foreignKey: 'fromUserId', as: 'sentRequests' });
User.hasMany(SwapRequest, { foreignKey: 'toUserId',   as: 'receivedRequests' });
SwapRequest.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
SwapRequest.belongsTo(User, { foreignKey: 'toUserId',   as: 'toUser' });

Skill.hasMany(SwapRequest, { foreignKey: 'skillOfferedId', as: 'offeredRequests' });
Skill.hasMany(SwapRequest, { foreignKey: 'skillWantedId',  as: 'wantedRequests' });
SwapRequest.belongsTo(Skill, { foreignKey: 'skillOfferedId', as: 'skillOffered' });
SwapRequest.belongsTo(Skill, { foreignKey: 'skillWantedId',  as: 'skillWanted' });

module.exports = SwapRequest;
