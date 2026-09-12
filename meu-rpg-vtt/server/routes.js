const express = require('express');
const router = express.Router();

const authController = require('./controllers/authController');
const gameController = require('./controllers/gameController');
const authMiddleware = require('./middleware/authMiddleware');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Game routes (protected: require a token)
router.post('/games/create', authMiddleware, gameController.createGame); // Create a game
router.post('/games/join', authMiddleware, gameController.joinGame);     // Join with a code
router.get('/games/my-games', authMiddleware, gameController.listMyGames); // List my games

module.exports = router;