const { Game, User, UserGame } = require('../database/db');
const { v4: uuidv4 } = require('uuid'); // Instale: npm install uuid

exports.createGame = async (req, res) => {
  const { name, userId } = req.body;
  try {
    // 1. Cria a mesa
    const newGame = await Game.create({
      name,
      inviteCode: uuidv4().slice(0, 8) // Gera um código curto ex: 'a1b2c3d4'
    });

    // 2. Adiciona o criador como MESTRE
    await UserGame.create({
      UserId: userId,
      GameId: newGame.id,
      role: 'MESTRE'
    });

    res.json(newGame);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar mesa' });
  }
};

exports.listMyGames = async (req, res) => {
  const { userId } = req.query; // Pega da URL: /my-games?userId=1
  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Game,
        through: { attributes: ['role'] } // Traz qual é a role dele naquela mesa
      }
    });
    res.json(user ? user.Games : []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
};

exports.joinGame = async (req, res) => {
  const { userId, inviteCode } = req.body;
  try {
    const game = await Game.findOne({ where: { inviteCode } });
    if (!game) return res.status(404).json({ error: 'Mesa não encontrada' });

    // Adiciona como JOGADOR
    await UserGame.create({
      UserId: userId,
      GameId: game.id,
      role: 'JOGADOR'
    });

    res.json({ message: 'Entrou na mesa!', game });
  } catch (error) {
    res.status(400).json({ error: 'Você já está nessa mesa ou erro interno' });
  }
};