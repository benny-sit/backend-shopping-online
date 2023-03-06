import { Schema, model, Document} from "mongoose";

export type TCategory = {
    name: string,
}

interface ICategory extends TCategory, Document {}

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
})

const Category = model<ICategory>("Category", CategorySchema);

export default Category
