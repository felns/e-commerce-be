const Cart = require('../models/cart');

/**
 * Retrieve the authenticated user's cart.  If the user does not yet have a
 * cart, an empty one is created and returned.  Cart items are populated
 * with product details for convenience.
 */
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

/**
 * Add an item to the user's cart.  If the item already exists in the cart
 * the quantity is incremented, otherwise the item is added.  Requires
 * `productId` and `quantity` in the request body.  Returns the updated cart.
 */
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: 'productId and quantity are required' });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const existing = cart.items.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    const saved = await cart.save();
    const populated = await saved.populate('items.product');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * Update the quantity of an item in the cart.  Requires `productId` and
 * `quantity` in the request body.  Returns the updated cart.  If the cart
 * or item cannot be found, a 404 response is returned.
 */
exports.updateItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const item = cart.items.find(
      (i) => i.product.toString() === productId.toString()
    );
    if (!item) {
      return res
        .status(404)
        .json({ message: 'Product not found in cart' });
    }
    item.quantity = quantity;
    const saved = await cart.save();
    const populated = await saved.populate('items.product');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * Remove an item from the cart.  Requires `productId` in the request body.
 * Returns the updated cart.  If the cart or item does not exist, a 404
 * response is returned.
 */
exports.removeItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    const saved = await cart.save();
    const populated = await saved.populate('items.product');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * Clear all items from the cart.  Returns a confirmation message.
 */
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};