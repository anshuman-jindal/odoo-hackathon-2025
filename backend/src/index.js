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
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server listening on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });
