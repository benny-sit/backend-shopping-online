import express from 'express';
import { checkUser } from '../../middlewares/authMiddleware';
import { AuthRoutes } from './routes';

const router = express.Router();

router.post('/login', AuthRoutes.login);

router.post('/register', AuthRoutes.register);

router.get('/logout', AuthRoutes.logout);


router.get('/refresh', checkUser, AuthRoutes.refreshToken);

export { router as AuthRouter}