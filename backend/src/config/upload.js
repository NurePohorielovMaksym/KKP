import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname); 
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Тільки зображення дозволені'), false);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});