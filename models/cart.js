const mongoose = require('mongoose');

/**
 * Cart schema maintains a user's shopping cart.  Each cart belongs to a
 * particular user and contains an array of items.  Each item stores a
 * reference to a product and the desired quantity.  Timestamps track
 * creation and updates so the cart can be expired or analyzed if needed.
 */
const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cart', cartSchema);