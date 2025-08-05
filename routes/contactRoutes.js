const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public endpoint to submit contact form
router.post('/', sendMessage);

// Admin endpoint to view messages
router.get('/', protect, admin, getMessages);

module.exports = router;