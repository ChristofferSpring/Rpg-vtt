const express = require('express');
const router = express.Router();

const authController = require('./controllers/authController');
const gameController = require('./controllers/gameController');
const authMiddleware = require('./middleware/authMiddleware');
const boardController = require('./controllers/boardController');
const tokenController = require('./controllers/tokenController');
const backgroundController = require('./controllers/backgroundController');
const { requireGameMember, requireGameMaster } = require('./middleware/gameMembership');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Game routes (protected: require a token)
router.post('/games/create', authMiddleware, gameController.createGame); // Create a game
router.post('/games/join', authMiddleware, gameController.joinGame);     // Join with a code
router.get('/games/my-games', authMiddleware, gameController.listMyGames); // List my games
router.get('/games/:gameId/board', authMiddleware, requireGameMember, boardController.getBoard);
router.get('/games/:gameId/members', authMiddleware, requireGameMember, boardController.getMembers);
router.post('/games/:gameId/tokens', authMiddleware, requireGameMember, requireGameMaster, tokenController.createToken);
router.patch('/games/:gameId/tokens/:tokenId', authMiddleware, requireGameMember, requireGameMaster, tokenController.updateToken);
router.delete('/games/:gameId/tokens/:tokenId', authMiddleware, requireGameMember, requireGameMaster, tokenController.deleteToken);
router.post(
  '/games/:gameId/background',
  authMiddleware,
  requireGameMember,
  requireGameMaster,
  backgroundController.uploadMiddleware,
  backgroundController.uploadBackground
);

module.exports = router;