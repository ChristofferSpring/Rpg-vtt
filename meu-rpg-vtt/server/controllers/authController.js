const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../database/db');

const SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.json({ id: user.id, username: user.username });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed - username might already be taken' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
};