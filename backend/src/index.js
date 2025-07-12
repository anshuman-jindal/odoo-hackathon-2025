const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Skill Swap API is up and running!');
});

// Start server after DB connection
// Import models so associations get registered:
require('./models/User');
require('./models/Skill');
require('./models/UserSkill');
require('./models/SwapRequest');
require('./models/Rating');

// Sync DB
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ Database & tables synced');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ Sync error:', err);
  });

console.log("✅ Loaded environment variables:");
console.log(process.env);

