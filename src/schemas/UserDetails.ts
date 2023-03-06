import { Schema, model, Document } from "mongoose";

export type TUserDetails = {
    firstName: string,
    lastName: string,
    address?: {
        city: string,
        street: string,
    },
    isAdmin: boolean,

    orders: Schema.Types.ObjectId[],
    cart: Schema.Types.ObjectId,
    
    refreshToken: string,
}

export interface IUserDetails extends TUserDetails, Document {}

const UserDetailsSchema = new Schema({
    idNumber: {
        type: String,
        validate: {
            validator: function(v: string) {
                return /\d{9}/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid Id number`
        },
        unique: true,
        required: [true, 'Id is required']
    },
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required'],
    },
    email: {
        type: String,
        validate: {
            validator: function(v: string) {
                return /(.+)@(.+){2,}\.(.+){2,}/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid email address`
        },
        required: [true, 'Email is required'],
    },
    address: {
        city: { type: String, },
        street: { type: String, },
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },

    orders: [{ type: Schema.Types.ObjectId, ref: 'Order'}],
    
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    },

    refreshToken: {
        type: String,
    }
});

const UserDetails = model<IUserDetails>("UserDetails", UserDetailsSchema);

export default UserDetails;