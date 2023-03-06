import express from "express";
import { checkAdmin, checkUser } from "../../middlewares/authMiddleware";
import { CategoryRoutes } from "./routes";

const router = express.Router();

router.use(checkUser)

router.get('/', CategoryRoutes.getAllCategories);

router.use(checkAdmin)

router.post('/', CategoryRoutes.createCategory)
    .delete('/', CategoryRoutes.deleteCategory);

export { router as CategoryRouter} 

