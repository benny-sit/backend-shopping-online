import express from "express";
import { checkAdmin, checkUser } from "../../middlewares/authMiddleware";
import { ItemsRoutes } from "./routes";

const router = express.Router();

// User routes
router.use(checkUser)

router.get('/', ItemsRoutes.getItems);

// Admin routes
router.use(checkAdmin);

router.delete('/', ItemsRoutes.deleteItem)
    .post('/', ItemsRoutes.createItem)
    .put('/', ItemsRoutes.updateItem);


export { router as ItemsRouter} 

