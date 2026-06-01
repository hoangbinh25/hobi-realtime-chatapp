import express from 'express';
import { signIn, signUp, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logout);

export default router;
