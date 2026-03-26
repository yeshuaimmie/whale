const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

function ensureUploadsDir() {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}

const createStorage = (folder) => {
  if (hasCloudinary) {
    return new CloudinaryStorage({
      cloudinary,
      params: async () => ({
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1400, crop: 'limit' }],
      }),
    });
  }

  const uploadDir = ensureUploadsDir();
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
};

const createUploader = (folder) => multer({
  storage: createStorage(folder),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) return cb(new Error('Only JPG, PNG and WEBP images are allowed'));
    return cb(null, true);
  },
});

function getUploadedAsset(file) {
  if (!file) return null;
  if (file.path && /^https?:/i.test(file.path)) {
    return { publicId: file.filename || file.public_id, url: file.path };
  }
  if (file.filename) {
    return { publicId: file.filename, url: `/uploads/${file.filename}` };
  }
  return null;
}

module.exports = {
  uploadProfileImage: createUploader('whale-investors/profiles'),
  uploadDepositProof: createUploader('whale-investors/deposits'),
  getUploadedAsset,
};
