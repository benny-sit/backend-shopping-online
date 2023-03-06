import { Schema, model, Document, Types } from "mongoose";
import { TUserDetails } from "./UserDetails";

export type TUser = {
  username: string;
  password: string;
  userDetails: Types.ObjectId | TUserDetails;
};

interface IUser extends TUser, Document {}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9\_\-]+$/, "is invalid"],
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    userDetails: {
      type: Schema.Types.ObjectId,
      ref: "UserDetails",
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", UserSchema);

export default User;
