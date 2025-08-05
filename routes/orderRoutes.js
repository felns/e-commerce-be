const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

// Create a new order from the cart
router.post('/', createOrder);

// Get orders belonging to the authenticated user
router.get('/mine', getMyOrders);

// Admin: get all orders
router.get('/', admin, getAllOrders);

// Get a specific order by ID (user or admin)
router.get('/:id', getOrderById);

// Admin: update order status
router.put('/:id', admin, updateOrderStatus);

module.exports = router;