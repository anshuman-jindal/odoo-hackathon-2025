const createError = require('http-errors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT and attach user info to req.user
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(createError(401, 'Authorization header required'));

  const token = authHeader.split(' ')[1];
  if (!token) return next(createError(401, 'Token missing'));

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return next(createError(403, 'Invalid or expired token'));
    req.user = { id: payload.userId, role: payload.role };
    next();
  });
}

module.exports = authenticateJWT;
