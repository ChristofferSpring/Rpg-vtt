const { Token } = require('../database/db');

exports.createToken = async (req, res) => {
  const gameId = Number(req.params.gameId);
  const { label, color, ownerId, visibility, x, y } = req.body;

  if (!label || !label.trim()) {
    return res.status(400).json({ error: 'Token label is required' });
  }

  try {
    const token = await Token.create({
      GameId: gameId,
      label: label.trim(),
      color: color || '#3182ce',
      ownerId: ownerId || null,
      visibility: visibility === 'owner' ? 'owner' : 'all',
      x: x ?? 0,
      y: y ?? 0
    });

    const io = req.app.get('io');
    io.to(String(gameId)).emit('token_created', token);

    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Error creating token' });
  }
};
