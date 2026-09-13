const { Game, User, UserGame } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

exports.createGame = async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;
  try {
    // 1. Create the game
    const newGame = await Game.create({
      name,
      inviteCode: uuidv4().slice(0, 8) // Generates a short code, e.g. 'a1b2c3d4'
    });

    // 2. Add the creator as MASTER
    await UserGame.create({
      UserId: userId,
      GameId: newGame.id,
      role: 'MASTER'
    });

    res.json(newGame);
  } catch (error) {
    res.status(500).json({ error: 'Error creating game' });
  }
};

exports.listMyGames = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Game,
        through: { attributes: ['role'] } // Brings back the user's role in that game
      }
    });
    res.json(user ? user.Games : []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching games' });
  }
};

exports.joinGame = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.userId;
  try {
    const game = await Game.findOne({ where: { inviteCode } });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    // Add as PLAYER
    await UserGame.create({
      UserId: userId,
      GameId: game.id,
      role: 'PLAYER'
    });

    res.json({ message: 'Joined the game!', game });
  } catch (error) {
    res.status(400).json({ error: "Couldn't join - you might already be in this game" });
  }
};
