const { UserGame } = require('../database/db');

exports.requireGameMember = async (req, res, next) => {
  const gameId = Number(req.params.gameId);
  if (!Number.isInteger(gameId)) {
    return res.status(400).json({ error: 'Invalid game id' });
  }
  try {
    const membership = await UserGame.findOne({
      where: { UserId: req.userId, GameId: gameId }
    });
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this game' });
    }
    req.gameRole = membership.role;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error checking game membership' });
  }
};

exports.requireGameMaster = (req, res, next) => {
  if (req.gameRole !== 'MASTER') {
    return res.status(403).json({ error: 'Master role required' });
  }
  next();
};
