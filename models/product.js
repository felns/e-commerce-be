const mongoose = require('mongoose');

/**
 * Product schema defines the structure of product documents.  In addition to
 * basic fields (name, price, description and image), products may belong to
 * a category, include brand information, have stock counts, support
 * variant options (colors and sizes), and participate in flash sales.
 * Each product tracks an average rating and number of reviews; reviews are
 * stored in a separate collection and referenced here via ObjectId.
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: String },
    countInStock: { type: Number, default: 0 },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    isFlashSale: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    saleEnd: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);