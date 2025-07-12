const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const userRouter = require('./routes/users');

require('dotenv').config();

const authRouter = require('./routes/auth');
const swapRouter = require('./routes/swapRequests');
const ratingRouter = require('./routes/ratings');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/swap-requests', swapRouter);
app.use('/ratings', ratingRouter);

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

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
