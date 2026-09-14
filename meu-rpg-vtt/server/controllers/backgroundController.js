const { Game } = require('../database/db');
const imageUploadMiddleware = require('../middleware/imageUpload');

exports.uploadMiddleware = imageUploadMiddleware('background');

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
