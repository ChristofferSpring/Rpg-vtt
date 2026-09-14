const jwt = require('jsonwebtoken');
const { User } = require('../database/db');

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // token signature/expiry alone isn't enough - the user it points to
    // may have since been deleted (e.g. test data cleanup), which would
    // otherwise surface as a foreign key error deep in a route handler
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
