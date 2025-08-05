const Order = require('../models/order');
const Cart = require('../models/cart');

/**
 * Create a new order from the authenticated user's cart.  The cart must not
 * be empty.  After creating the order, the cart is cleared.  Expects
 * `paymentMethod` and a `shippingAddress` in the request body.  Returns
 * the created order document.
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    // Find the user's cart and populate product details
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    // Create order items from the cart
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));
    // Calculate total price
    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });
    const saved = await order.save();
    // Clear cart
    cart.items = [];
    await cart.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all orders for the authenticated user.  Populates product and user
 * details for each order.  Returns an array of orders.
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product')
      .populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific order by ID.  The authenticated user must either be the
 * owner of the order or an administrator.  Returns the order with
 * populated product and user fields.
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product')
      .populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Check access
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all orders in the system.  Only available to administrators.
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('orderItems.product')
      .populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * Update order payment or delivery status.  Only administrators can update
 * orders.  Accepts fields like `isPaid`, `paidAt`, `isDelivered` and
 * `deliveredAt`, as well as nested `paymentResult` info.  Returns the
 * updated order.
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const { isPaid, paidAt, isDelivered, deliveredAt, paymentResult } =
      req.body;
    if (isPaid !== undefined) order.isPaid = isPaid;
    if (paidAt) order.paidAt = paidAt;
    if (isDelivered !== undefined) order.isDelivered = isDelivered;
    if (deliveredAt) order.deliveredAt = deliveredAt;
    if (paymentResult) order.paymentResult = paymentResult;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};