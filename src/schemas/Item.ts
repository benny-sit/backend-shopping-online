import { Schema, model, Document } from "mongoose";

export type TItem = {
    name: string,
    price: number,
    imgUrl: string,
    category: Schema.Types.ObjectId,
}

export interface IItem extends TItem, Document {}

const ItemSchema = new Schema({
    size: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        min: [0, 'Price needs to be positive'],
        default: 0,
    },
    imgUrl: {
        type: String,
    },
    manufacturer: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
})

const Item = model<IItem>("Item", ItemSchema);

export default Item;