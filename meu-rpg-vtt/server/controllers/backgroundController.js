const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Game } = require('../database/db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const MIME_EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  // Extension must come from the validated mimetype, never from the
  // client-supplied original filename (which could smuggle in a `.svg`/
  // `.html` extension past the mimetype allowlist and be served as such by
  // express.static, enabling stored XSS).
  filename: (req, file, cb) => cb(null, `${uuidv4()}${MIME_EXTENSIONS[file.mimetype] || ''}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only PNG, JPEG, GIF, or WEBP images are allowed'));
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
