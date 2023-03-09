import { Response, Request, NextFunction } from "express";
import Cart from "../../schemas/Cart";
import { IItem } from "../../schemas/Item";
import Order from "../../schemas/Order";
import UserDetails from "../../schemas/UserDetails";

async function createOrder(req: Request, res: Response) {
  if (!req.body.user.userDetails.cart)
    return res
      .status(200)
      .json({ error: { message: "You don't have any items in your order" } });

  if (!req.body.last4digits) return res.status(400).json({ error: { message: "Need to provider 4 digits of credit card" } });

  const user = req.body.user;
  const cartId = req.body.user.userDetails.cart;

  let totalPrice: number = 0;
  try {
    const userCart = await Cart.findById(cartId).populate<{
      "cartItems.item": IItem;
    }>("cartItems.item");

    totalPrice =
      userCart?.cartItems.reduce(
        (acc, curr: any) => acc + curr.quantity * curr.item.price,
        0
      ) || 0;
  } catch (error) {
    return res.status(400).json({ error });
  }

  if(totalPrice === 0) return res.status(400).json({ error: { message: "Cart Is Empty" } });

  const order = new Order({finalPrice: totalPrice, shippingAddress: user.userDetails.address, last4digits: req.body.last4digits, cart: cartId});
  const newCart = new Cart();

  try {
    console.log(order)
    await order.save();
    await newCart.save();
    const userdet = await UserDetails.findByIdAndUpdate(
      user.userDetails, 
      {
        $push: {
          orders: order
        },
        $set: {
          cart: newCart,
        }
      },
      {new: true}
    )
    res.status(200).json(userdet)
  } catch (error) {
    return res.status(400).json({ error });
  }


}

async function getAllOrders(req: Request, res: Response) {
  const ordersIds: any[] = req.body.user.userDetails.orders;

  try {
    const orders = await Order.find({ _id: { $in: ordersIds } });
    res.status(200).json(orders);
  } catch (error) {
    return res.status(400).json({ error });
  }
}

export const OrderRoutes = {
  createOrder,
  getAllOrders,
};
