import express from 'express'
import { checkUser } from '../../middlewares/authMiddleware';
import { OrderRoutes } from './routes';

const router = express.Router();

router.use(checkUser);

router.post('/', OrderRoutes.createOrder)
    .get('/', OrderRoutes.getAllOrders);


export { router as OrderRouter}