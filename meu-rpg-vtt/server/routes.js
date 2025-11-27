const express = require('express');
const router = express.Router();

const authController = require('./controllers/authController');
const gameController = require('./controllers/gameController');

// Rotas de Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas de Game
router.post('/games/create', gameController.createGame); // Criar mesa
router.post('/games/join', gameController.joinGame);     // Entrar com código
router.get('/games/my-games', gameController.listMyGames); // Listar minhas mesas

module.exports = router;