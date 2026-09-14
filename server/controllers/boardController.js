const { Game, Token, ChatMessage, DrawingStroke, UserGame, User } = require('../database/db');

exports.getBoard = async (req, res) => {
  const gameId = Number(req.params.gameId);
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const tokens = await Token.findAll({ where: { GameId: gameId } });
    const visibleTokens = tokens.filter((token) => {
      if (token.visibility === 'all') return true;
      return req.gameRole === 'MASTER' || token.ownerId === req.userId;
    });

    const recentMessages = await ChatMessage.findAll({
      where: { GameId: gameId },
      order: [['createdAt', 'DESC']],
      limit: 200
    });
    const messages = recentMessages.reverse();
    const strokes = await DrawingStroke.findAll({ where: { GameId: gameId } });

    res.json({
      tokens: visibleTokens,
      messages,
      strokes,
      backgroundImageUrl: game.backgroundImageUrl,
      gridWidth: game.gridWidth,
      gridHeight: game.gridHeight
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching board' });
  }
};

exports.getMembers = async (req, res) => {
  const gameId = Number(req.params.gameId);
  try {
    const memberships = await UserGame.findAll({
      where: { GameId: gameId },
      include: { model: User, attributes: ['id', 'username'] }
    });
    const members = memberships.map((membership) => ({
      userId: membership.User.id,
      username: membership.User.username,
      role: membership.role
    }));
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching members' });
  }
};
