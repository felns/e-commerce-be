const mongoose = require('mongoose');

/**
 * Review schema stores user feedback for products.  Each review belongs to
 * both a product and a user.  Ratings are numeric and comments are free
 * text.  Timestamps capture when the review was written or updated.
 */
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);