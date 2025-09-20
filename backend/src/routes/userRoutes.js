import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, getUserPosts, uploadAvatar } from '../controllers/userController.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

// Multer storage for avatar uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().trim(),
  body('avatarUrl').optional().isURL().withMessage('avatarUrl must be a valid URL'),
  body('location').optional().trim(),
  body('website').optional().trim(),
  body('birthday').optional().isISO8601().toDate(),
  body('occupation').optional().trim(),
], updateProfile);
router.get('/me/posts', requireAuth, getUserPosts);
router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);

router.get('/:id', getProfile);
router.get('/:id/posts', getUserPosts);

export default router;
