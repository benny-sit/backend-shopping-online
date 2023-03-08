import { Schema, model, Document } from 'mongoose'

export type TOrder = {
    shippingAddress: {
        city: string,
        street: string,
    },
    finalPrice: number,

    shippingDate: Date,
    orderDate: Date,
    last4digits: string,

    userDetails: Schema.Types.ObjectId,
    cart: Schema.Types.ObjectId,
}

interface IOrder extends TOrder, Document {}

const OrderSchema = new Schema({
    shippingAddress: {
        city: { type: String},
        street: { type: String},
    },
    finalPrice: { type: Number, default: 0},
    shippingDate: { type: Date, default: new Date(), 
        validate: function(input: any) {
            /* return true only if the input is a valid date, AND is 
            greater than or equal to the current date/time */
            return Date.parse(input) && new Date(input) >= new Date();
        },
        message: (input: any) => `${input} must be greater than or equal to the current date!`
    },
    orderDate: { type: Date, default: new Date()},
    last4digits: { type: String, required: true, minLength: 4, maxLength: 4},
    
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
    }
});

const Order = model<IOrder>("Order", OrderSchema);

export default Order;