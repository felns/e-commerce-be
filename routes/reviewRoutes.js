const express = require('express');
const router = express.Router();
const {
  getReviewsByProduct,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all reviews for a product (public)
router.get('/:productId', getReviewsByProduct);

// Delete a review by ID (author or admin)
router.delete('/:id', protect, deleteReview);

module.exports = router;