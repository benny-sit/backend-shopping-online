import { Schema, Document, model } from "mongoose";

export type TCart = {
    cartItems: TCartItem[],
    userId: Schema.Types.ObjectId,
}

export type TCartItem = {
    quantity: Number,
    item: Schema.Types.ObjectId,
}

interface ICart extends TCart, Document {}

const CartSchema = new Schema({
    cartItems: [{
        quantity: {
            type: Number,
            default: 1,
            min: [0, "Quantity needs to be positive"]
        },
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
        }
    }],
}, {
    timestamps: true,
})

const Cart = model<ICart>("Cart", CartSchema);

export default Cart;
