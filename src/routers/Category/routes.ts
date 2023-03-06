import { Request, Response, NextFunction } from "express";
import Category from "../../schemas/Category";

async function getAllCategories(req: Request, res: Response) {

    const categories = await Category.find({});

    return res.status(200).json(categories);
}

// ADMIN FUNCTIONS
async function createCategory(req: Request, res: Response) {
    if (!req.body.name) return res.status(400).json({ error: { message: 'No Name' } });

    try {
        const category = await Category.create({ name: req.body.name});
        res.status(201).json(category);
    } catch (error: any) {
        if(error.code === 11000) return res.status(400).json({error: { message: 'Category Already Exists'}})
        return res.status(400).json({error})
    }
}

async function deleteCategory(req: Request, res: Response) {
    if (!req.body.name) return res.status(400).json({ error: { message: 'No Name' } });

    try {
        await Category.deleteOne({name: req.body.name});
        res.status(200).json({ success: `${req.body.name} category deleted`});
    } catch (error) {
        return res.status(400).json({ error });
    }
}


export const CategoryRoutes = {
    getAllCategories,
    createCategory,
    deleteCategory,
}





