const express = require('express');
const router = express.Router();

const authController = require('./controllers/authController');
const gameController = require('./controllers/gameController');
const authMiddleware = require('./middleware/authMiddleware');

// Rotas de Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas de Game (protegidas: exigem token)
router.post('/games/create', authMiddleware, gameController.createGame); // Criar mesa
router.post('/games/join', authMiddleware, gameController.joinGame);     // Entrar com código
router.get('/games/my-games', authMiddleware, gameController.listMyGames); // Listar minhas mesas

module.exports = router;