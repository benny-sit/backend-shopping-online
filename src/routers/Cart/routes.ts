import { Request, Response, NextFunction } from "express";
import Cart from "../../schemas/Cart";
import { IItem } from "../../schemas/Item";

async function getAllCartItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.body.user);
  if (!req.body.user.userDetails.cart) return res.status(200).json([]);

  const cartId = req.body.user.userDetails.cart;

  try {
    const userCart = await Cart.findById(cartId).populate<{
      "cartItems.item": IItem;
    }>("cartItems.item");
    res.status(200).json({cartItems: userCart?.cartItems});
  } catch (error) {
    return res.status(400).json({ error });
  }
}

async function changeCartItem(req: Request, res: Response, next: NextFunction) {
  if (!req.body.itemId || !req.body.quantity)
    return res
      .status(400)
      .json({ error: { message: "Need to provide quantity and Item Id" } });

  const user = req.body.user;
  const quantity = req.body.quantity;
  const itemId = req.body.itemId;

  if (!req.body.user.userDetails.cart) {
    const userCart = new Cart({
      cartItems: [{ quantity: req.body.quantity, item: req.body.itemId }],
    });
    try {
      user.userDetails.cart = userCart;
      await user.userDetails.save();
      await userCart.save();
    } catch (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({cartItems: userCart?.cartItems});
  }

  const cartId = user.userDetails.cart;

  let cart;
  try {
    const hasItem = await Cart.countDocuments({ _id: cartId, 'cartItems.item': itemId });

    if(hasItem && quantity < 1) {
      cart = await Cart.findOneAndUpdate(
        { _id: cartId, },
        { $pull: { cartItems: { item: itemId } }},
        {new: true}
      )
      return res.status(200).json(cart)
    }

    if (quantity < 1) {
      return res.status(400).json({ error: { message: 'Item quantity must be greater than zero'}})
    }

    if (hasItem) {
      cart = await Cart.findOneAndUpdate(
        { _id: cartId, 'cartItems.item': itemId },
        { $set: { "cartItems.$.quantity": quantity}},
        { new: true},
      )
    } else {
      cart = await Cart.findOneAndUpdate(
        { _id: cartId,},
        { $push: { cartItems: { item: itemId, quantity: quantity } } },
        { new: true},
      )
    }

    res.status(200).json({cartItems: cart?.cartItems});
  } catch (error) {
    return res.status(400).json({ error });
  }
}

async function incrementQuantity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if(!req.body.itemId) return res.status(400).json({ error: { message: "Item Id is required" } });

  const itemId = req.body.itemId;
  const user = req.body.user;

  const cartId = user.userDetails.cart;

  if (!cartId) {
    const userCart = new Cart({
      cartItems: [{ quantity: 1, item: req.body.itemId }],
    });
    try {
      user.userDetails.cart = userCart;
      await user.userDetails.save();
      await userCart.save();
    } catch (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({cartItems: userCart?.cartItems});
  }

  try {
    const hasItem = await Cart.countDocuments({ _id: cartId, 'cartItems.item': itemId });

    let cart;
    if (hasItem) {
      cart = await Cart.findOneAndUpdate(
        { _id: cartId, 'cartItems.item': itemId },
        { $inc: { "cartItems.$.quantity": 1}},
        { new: true},
      )
    } else {
      cart = await Cart.findOneAndUpdate(
        { _id: cartId,},
        { $push: { cartItems: { item: itemId, quantity: 1 } } },
        { new: true},
      )
    }

    res.status(200).json({cartItems: cart?.cartItems})
  } catch (error) {
    return res.status(400).json({error})
  }

}

async function decrementQuantity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if(!req.body.itemId) return res.status(400).json({ error: { message: "Item Id is required" } });

  const itemId = req.body.itemId;
  const user = req.body.user;

  const cartId = user.userDetails.cart;

  if(!cartId) return res.status(404).json({ error: { message: "You don't have a cart"}})

  try {
    await Cart.findOneAndUpdate(
      { _id: cartId, 'cartItems.item': itemId },
      { $inc: { "cartItems.$.quantity": -1}},
      { new: true},
    )

    const cart = await Cart.findOneAndUpdate(
      { _id: cartId, },
      { $pull: { cartItems: { quantity: {$lt: 1} } }},
      {new: true}
    )

    res.status(200).json({cartItems: cart?.cartItems});
  } catch (error) {
    return res.status(400).json({error})
  }
}

async function deleteCartItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if(!req.body.itemId) return res.status(400).json({ error: { message: "Item Id is required" } });

  const itemId = req.body.itemId;
  const user = req.body.user;

  const cartId = user.userDetails.cart;
  
  if(!cartId) return res.status(404).json({ error: { message: "You don't have a cart"}})

  try {
    const cart = await Cart.findOneAndUpdate(
      { _id: cartId, },
      { $pull: { cartItems: { item: itemId } }},
      {new: true}
    )
    return res.status(200).json({cartItems: cart?.cartItems})
  } catch (error) {
    return res.status(400).json({error})
  }

}

async function calculatePrice(req: Request, res: Response) {
  if (!req.body.user.userDetails.cart) return res.status(200).json({total: 0});

  const cartId = req.body.user.userDetails.cart;

  let totalPrice: number = 0;
  try {
    const userCart = await Cart.findById(cartId).populate<{
      "cartItems.item": IItem;
    }>("cartItems.item");


    totalPrice = userCart?.cartItems.reduce((acc, curr: any) => acc + curr.quantity * curr.item.price, 0) || 0;

    res.status(200).json({total: totalPrice});
  } catch (error) {
    return res.status(400).json({ error });
  }
}

async function clearCart(req: Request, res: Response, next: NextFunction) {}

export const CartRoutes = {
  getAllCartItems,
  changeCartItem,
  incrementQuantity,
  decrementQuantity,
  deleteCartItem,
  clearCart,
  calculatePrice,
};
