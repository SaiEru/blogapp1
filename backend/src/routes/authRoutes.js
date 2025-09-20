import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, googleOAuth, loginWithFirebase } from '../controllers/authController.js';

const router = Router();

router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.get('/google', googleOAuth);

router.post('/firebase', [
  body('idToken').notEmpty(),
], loginWithFirebase);

export default router;
