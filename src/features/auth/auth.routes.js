import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from '../users/user.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
import { authenticate } from '../../middleware/authenticate.js';

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export default router;