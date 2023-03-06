import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/connectDB";
import { AuthRouter } from "./routers/Auth/router";
import { CategoryRouter } from "./routers/Category/router";
import { ItemsRouter } from "./routers/Item/router";
import { CartRouter } from "./routers/Cart/router";
import { OrderRouter } from "./routers/Order/router";
const cors = require("cors");

    
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    exposedHeaders: ['Authorization']
}));

connectDB();

app.use('/auth', AuthRouter);
app.use('/category', CategoryRouter);
app.use('/item', ItemsRouter);
app.use('/cart', CartRouter);
app.use('/order', OrderRouter);

app.get('/', (req: express.Request, res: express.Response) => {
    return res.json({hello: "world!"});
});

app.use('*', (req: express.Request, res: express.Response) => {res.status(404).json({error: 'Route not found'})})

app.listen(process.env.PORT || 3001, () => {
    console.log("listening on port " + process.env.PORT || 3001);
})