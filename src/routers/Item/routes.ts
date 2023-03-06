import { Request, Response, NextFunction } from "express";
import Item from "../../schemas/Item";

async function getItems(req: Request, res: Response, next: NextFunction) {
    let perPage = req.query.perPage ? Math.min(Math.max(+req.query.perPage, 0), 50): 10;
    let page = req.query.page ? Math.max(+req.query.page, 0): 0;
    let categoryId = req.query.categoryId ? req.query.categoryId : '';
    let search = req.query.search ? req.query.search : '';
    

    try {
        const result = await Item.find({
            $and: [
                {
                    $or: [
                        {title: {$regex: search, $options: 'i'}},
                        {manufacturer: {$regex: search, $options: 'i'}},
                    ],
                },
                {category: categoryId },
            ]
        }, null, { skip: perPage * page, limit: perPage});

        res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({error});
    }


}

async function createItem(req: Request, res: Response, next: NextFunction ){

    try {
        const item = await Item.create(req.body);
        return res.status(201).json(item);
    } catch (error) {
        return res.status(400).json({error});
    }

}

async function updateItem(req: Request, res: Response, next: NextFunction) {
    if(!req.body._id) return res.status(400).json({error: {message: "Please Provide Id of Item"}});

    const {_id: _, ...update} = req.body;

    try {
        const newItem = await Item.findByIdAndUpdate(req.body._id, update, { new: true});
        res.status(200).json(newItem);
    } catch (error) {
        return res.status(400).json({error});
    }


}

async function deleteItem(req: Request, res: Response, next: NextFunction) {
    if (!req.body._id) return res.status(400).json({ error: { message: 'Please Provide Id of Item' } });

    try {
        const ans = await Item.deleteOne({_id: req.body._id});
        res.status(200).json(ans);
    } catch (error) {
        return res.status(400).json({error});
    }

}

export const ItemsRoutes = {
    getItems,
    createItem,
    updateItem,
    deleteItem,
}