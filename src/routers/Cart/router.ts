import express from "express";
import { checkUser } from "../../middlewares/authMiddleware";
import { CartRoutes } from "./routes";


const router = express.Router();

// Populating User before using
router.use(checkUser);

router.get('/', CartRoutes.getAllCartItems)
    .post('/', CartRoutes.changeCartItem)
    .delete('/', CartRoutes.deleteCartItem);

router.post('/inc', CartRoutes.incrementQuantity);

router.post('/dec', CartRoutes.decrementQuantity);

router.get('/price', CartRoutes.calculatePrice);

router.delete('/clear', CartRoutes.clearCart);

export { router as CartRouter} 

