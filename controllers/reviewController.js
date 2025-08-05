const Review = require('../models/review');

/**
 * Get all reviews for a specific product.  Populates the user field to
 * return the reviewer's name.  Returns an array of reviews.
 */
exports.getReviewsByProduct = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a review by ID.  Only the review author or an administrator can
 * perform this action.  Returns a confirmation message on success.
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    // Ensure the current user is the author or an admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};