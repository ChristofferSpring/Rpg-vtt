const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Game } = require('../database/db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  }
});

exports.uploadMiddleware = (req, res, next) => {
  upload.single('background')(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message });
    next();
  });
};

exports.uploadBackground = async (req, res) => {
  const gameId = Number(req.params.gameId);
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const backgroundImageUrl = `/uploads/${req.file.filename}`;
    await Game.update({ backgroundImageUrl }, { where: { id: gameId } });

    const io = req.app.get('io');
    io.to(String(gameId)).emit('background_updated', { backgroundImageUrl });

    res.json({ backgroundImageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading background' });
  }
};
