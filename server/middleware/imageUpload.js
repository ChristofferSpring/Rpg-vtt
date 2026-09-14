const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

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
  // extension comes from the checked mimetype, not the client's filename -
  // otherwise someone ships a .svg past the allowlist and it gets served as one
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${MIME_EXTENSIONS[file.mimetype] || ''}`)
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

module.exports = function imageUploadMiddleware(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error) return res.status(400).json({ error: error.message });
      next();
    });
  };
};
