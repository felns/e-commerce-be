const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Ensure user is authenticated for all cart routes
router.use(protect);

// Get current user's cart
router.get('/', getCart);

// Add an item to the cart
router.post('/add', addItem);

// Update an item's quantity in the cart
router.put('/update', updateItem);

// Remove an item from the cart
router.delete('/remove', removeItem);

// Clear the cart
router.delete('/clear', clearCart);

module.exports = router;